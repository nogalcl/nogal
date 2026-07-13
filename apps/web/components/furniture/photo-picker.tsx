"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { X as XIcon, UploadCloud } from "lucide-react";
import { MAX_IMAGES, MIN_IMAGES_TO_PUBLISH } from "@/lib/furniture/constants";

interface PhotoPickerProps {
  onFilesChange: (files: File[]) => void;
}

/**
 * Selector de fotos previo a la creación de la pieza: guarda los archivos en
 * memoria (no hay furnitureId todavía al que subirlos) y se los entrega al
 * formulario para que los suba justo después de crear la pieza, en el mismo
 * paso — así el vendedor no tiene que guardar primero y volver después.
 */
export function PhotoPicker({ onFilesChange }: PhotoPickerProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  );
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  function addFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList);
    const next = [...files, ...incoming].slice(0, MAX_IMAGES);
    setError(
      files.length + incoming.length > MAX_IMAGES
        ? `Máximo ${MAX_IMAGES} fotografías por pieza.`
        : null,
    );
    setFiles(next);
    onFilesChange(next);
  }

  function removeAt(index: number) {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    onFilesChange(next);
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
            addFiles(event.dataTransfer.files);
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
            if (event.target.files?.length) addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </button>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <p className="text-muted-foreground text-xs">
        {files.length} de mínimo {MIN_IMAGES_TO_PUBLISH} fotografías
        recomendadas — puedes publicar con menos y añadir el resto después.
        La primera es la foto principal.
      </p>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-4 md:grid-cols-4">
          {previews.map((url, index) => (
            <div
              key={url}
              className="border-border bg-muted relative aspect-square overflow-hidden border"
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="200px"
                className="object-cover"
                unoptimized
              />
              {index === 0 ? (
                <span className="bg-carbon/80 text-beige absolute left-1 top-1 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                  Principal
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label="Quitar foto"
                className="bg-carbon/80 text-beige absolute right-1 top-1 flex size-6 items-center justify-center"
              >
                <XIcon className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
