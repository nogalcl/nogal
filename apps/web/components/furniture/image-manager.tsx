"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import {
  deleteFurnitureImageAction,
  reorderFurnitureImagesAction,
  uploadFurnitureImageAction,
} from "@/lib/furniture/actions";
import type { FurnitureImage } from "@/lib/api/types";
import { MAX_IMAGES, MIN_IMAGES_TO_PUBLISH } from "@/lib/furniture/constants";
import { SortableImage } from "./sortable-image";

interface ImageManagerProps {
  furnitureId: string;
  initialImages: FurnitureImage[];
}

export function ImageManager({
  furnitureId,
  initialImages,
}: ImageManagerProps) {
  const [images, setImages] = useState(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (images.length + files.length > MAX_IMAGES) {
      setError(`Máximo ${MAX_IMAGES} fotografías por pieza.`);
      return;
    }

    setError(null);
    setIsUploading(true);

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadFurnitureImageAction(furnitureId, formData);
      if (result.error) {
        setError(result.error);
      } else if (result.image) {
        setImages((prev) => [...prev, result.image as FurnitureImage]);
      }
    }

    setIsUploading(false);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setImages((prev) => {
      const oldIndex = prev.findIndex((image) => image.id === active.id);
      const newIndex = prev.findIndex((image) => image.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      void reorderFurnitureImagesAction(
        furnitureId,
        reordered.map((image) => image.id),
      );
      return reordered;
    });
  }

  async function handleDelete(id: string) {
    setImages((prev) => prev.filter((image) => image.id !== id));
    await deleteFurnitureImageAction(id);
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragOver(false);
          if (event.dataTransfer.files.length > 0) {
            void handleFiles(event.dataTransfer.files);
          }
        }}
        className={`flex flex-col items-center justify-center gap-2 border border-dashed px-6 py-12 text-center transition-colors ${
          isDragOver ? "border-foreground bg-muted" : "border-border"
        }`}
      >
        <UploadCloud className="text-muted-foreground size-6" />
        <p className="text-foreground text-sm">
          Arrastra fotografías aquí o haz clic para seleccionarlas
        </p>
        <p className="text-muted-foreground text-xs">
          JPEG, PNG, WebP o HEIC — se comprimen automáticamente
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files?.length)
              void handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </button>

      {isUploading && (
        <p className="text-muted-foreground text-xs">Subiendo fotografías…</p>
      )}
      {error && <p className="text-destructive text-sm">{error}</p>}

      <p className="text-muted-foreground text-xs">
        {images.length} de mínimo {MIN_IMAGES_TO_PUBLISH} fotografías requeridas
        para publicar. La primera fotografía es la principal — arrastra para
        reordenar.
      </p>

      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((image) => image.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-3 gap-4 md:grid-cols-4">
              {images.map((image, index) => (
                <SortableImage
                  key={image.id}
                  image={image}
                  isPrimary={index === 0}
                  onDelete={() => handleDelete(image.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
