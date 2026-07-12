import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  FurnitureSort,
  FurnitureStatus,
} from "@/common/graphql/furniture-enums";
import { generateUniqueSlug } from "@/common/utils/slug";
import {
  STORAGE_PROVIDER,
  type StorageProvider,
} from "@/modules/storage/storage.interface";
import { StoresService } from "@/modules/stores/stores.service";
import { NotificationsService } from "@/modules/notifications/notifications.service";
import { PrismaService } from "@/modules/prisma/prisma.service";
import type { CreateFurnitureInput } from "./dto/create-furniture.input";
import type { FurnitureFilterInput } from "./dto/furniture-filter.input";
import type { UpdateFurnitureInput } from "./dto/update-furniture.input";
import {
  FurnitureRepository,
  type FurniturePreviewRow,
  type FurnitureWithRelations,
} from "./furniture.repository";
import { FurnitureValidationService } from "./furniture.validation";

export interface Viewer {
  sub: string;
  role: string;
}

const PUBLIC_STATES: FurnitureStatus[] = [
  FurnitureStatus.PUBLISHED,
  FurnitureStatus.RESERVED,
  FurnitureStatus.SOLD,
];

const TRANSITIONS: Record<FurnitureStatus, FurnitureStatus[]> = {
  [FurnitureStatus.DRAFT]: [
    FurnitureStatus.UNDER_REVIEW,
    FurnitureStatus.ARCHIVED,
  ],
  [FurnitureStatus.UNDER_REVIEW]: [
    FurnitureStatus.PUBLISHED,
    FurnitureStatus.REJECTED,
    FurnitureStatus.ARCHIVED,
  ],
  [FurnitureStatus.PUBLISHED]: [
    FurnitureStatus.RESERVED,
    FurnitureStatus.SOLD,
    FurnitureStatus.DRAFT,
    FurnitureStatus.ARCHIVED,
  ],
  [FurnitureStatus.RESERVED]: [
    FurnitureStatus.SOLD,
    FurnitureStatus.DRAFT,
    FurnitureStatus.ARCHIVED,
  ],
  [FurnitureStatus.SOLD]: [FurnitureStatus.ARCHIVED],
  [FurnitureStatus.ARCHIVED]: [FurnitureStatus.DRAFT],
  [FurnitureStatus.REJECTED]: [],
};

const MAX_IMAGES = 20;

@Injectable()
export class FurnitureService {
  constructor(
    private readonly repo: FurnitureRepository,
    private readonly storesService: StoresService,
    private readonly validation: FurnitureValidationService,
    private readonly notifications: NotificationsService,
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  // ---------------------------------------------------------------------
  // Lectura
  // ---------------------------------------------------------------------

  async findBySlugForViewer(
    slug: string,
    viewer: Viewer | null,
  ): Promise<FurnitureWithRelations | null> {
    const furniture = await this.repo.findBySlug(slug);
    if (!furniture) return null;
    if (this.canView(furniture, viewer)) return furniture;
    return null;
  }

  async findMine(userId: string): Promise<FurnitureWithRelations[]> {
    const store = await this.storesService.findByOwnerId(userId);
    if (!store) return [];
    return this.repo.findManyByStore(store.id);
  }

  async explore(
    filter: FurnitureFilterInput | undefined,
    sort: FurnitureSort | undefined,
  ): Promise<{
    items: FurniturePreviewRow[];
    total: number;
    page: number;
    perPage: number;
  }> {
    const { items, total } = await this.repo.findManyForExplore(filter, sort);
    const page = Math.max(1, filter?.page ?? 1);
    const perPage = Math.min(60, Math.max(1, filter?.perPage ?? 24));
    return { items, total, page, perPage };
  }

  locations(): Promise<string[]> {
    return this.repo.distinctLocationCities();
  }

  /** Solo MODERATOR/ADMIN — guard de rol aplicado en el resolver. */
  findForModeration(status?: FurnitureStatus): Promise<FurnitureWithRelations[]> {
    return this.repo.findManyForModeration(status);
  }

  /** Para el formulario de edición: exige ser dueño (o staff), no expone piezas ajenas. */
  async findByIdForOwner(
    id: string,
    userId: string,
    role: string,
  ): Promise<FurnitureWithRelations> {
    return this.getOwned(id, userId, role);
  }

  async registerView(id: string): Promise<void> {
    await this.repo.update(id, { viewCount: { increment: 1 } });
  }

  // ---------------------------------------------------------------------
  // CRUD
  // ---------------------------------------------------------------------

  async create(
    userId: string,
    input: CreateFurnitureInput,
  ): Promise<FurnitureWithRelations> {
    const store = await this.storesService.findByOwnerId(userId);
    if (!store) {
      throw new ForbiddenException(
        "Necesitas crear tu atelier antes de añadir piezas.",
      );
    }

    const slug = await generateUniqueSlug(input.title, (candidate) =>
      this.repo.slugExists(candidate),
    );

    return this.repo.create({
      ...this.buildScalarData(input),
      title: input.title,
      description: input.description,
      condition: input.condition,
      price: input.price,
      slug,
      status: FurnitureStatus.DRAFT,
      store: { connect: { id: store.id } },
      category: { connect: { id: input.categoryId } },
      style: connectOptional(input.styleId),
      designer: connectOptional(input.designerId),
      manufacturer: connectOptional(input.manufacturerId),
      originCountry: connectOptional(input.originCountryId),
      locationCountry: connectOptional(input.locationCountryId),
      materials: connectManyOptional(input.materialIds),
      woodTypes: connectManyOptional(input.woodTypeIds),
    });
  }

  async update(
    userId: string,
    role: string,
    input: UpdateFurnitureInput,
  ): Promise<FurnitureWithRelations> {
    const existing = await this.getOwned(input.id, userId, role);
    this.assertEditable(existing);

    const wasRejected = existing.status === FurnitureStatus.REJECTED;

    return this.repo.update(input.id, {
      ...this.buildScalarData(input),
      ...(wasRejected
        ? { status: FurnitureStatus.DRAFT, rejectionReason: null }
        : {}),
      category: input.categoryId
        ? { connect: { id: input.categoryId } }
        : undefined,
      style:
        input.styleId !== undefined
          ? connectOrDisconnect(input.styleId)
          : undefined,
      designer:
        input.designerId !== undefined
          ? connectOrDisconnect(input.designerId)
          : undefined,
      manufacturer:
        input.manufacturerId !== undefined
          ? connectOrDisconnect(input.manufacturerId)
          : undefined,
      originCountry:
        input.originCountryId !== undefined
          ? connectOrDisconnect(input.originCountryId)
          : undefined,
      locationCountry:
        input.locationCountryId !== undefined
          ? connectOrDisconnect(input.locationCountryId)
          : undefined,
      materials: input.materialIds
        ? { set: input.materialIds.map((id) => ({ id })) }
        : undefined,
      woodTypes: input.woodTypeIds
        ? { set: input.woodTypeIds.map((id) => ({ id })) }
        : undefined,
    });
  }

  async duplicate(
    id: string,
    userId: string,
    role: string,
  ): Promise<FurnitureWithRelations> {
    const original = await this.getOwned(id, userId, role);
    const slug = await generateUniqueSlug(
      `${original.title} copia`,
      (candidate) => this.repo.slugExists(candidate),
    );

    return this.repo.create({
      title: `${original.title} (copia)`,
      slug,
      description: original.description,
      status: FurnitureStatus.DRAFT,
      store: { connect: { id: original.storeId } },
      category: { connect: { id: original.categoryId } },
      style: connectOptional(original.styleId ?? undefined),
      designer: connectOptional(original.designerId ?? undefined),
      manufacturer: connectOptional(original.manufacturerId ?? undefined),
      originCountry: connectOptional(original.originCountryId ?? undefined),
      locationCountry: connectOptional(original.locationCountryId ?? undefined),
      materials: { connect: original.materials.map((m) => ({ id: m.id })) },
      woodTypes: { connect: original.woodTypes.map((w) => ({ id: w.id })) },
      condition: original.condition,
      conditionNotes: original.conditionNotes,
      originality: original.originality,
      color: original.color,
      decade: original.decade,
      widthCm: original.widthCm,
      heightCm: original.heightCm,
      depthCm: original.depthCm,
      weightKg: original.weightKg,
      price: original.price,
      currency: original.currency,
      priceType: original.priceType,
      shippingMethods: original.shippingMethods,
      locationCity: original.locationCity,
      locationRegion: original.locationRegion,
      images: {
        create: original.images.map((image) => ({
          url: image.url,
          altText: image.altText,
          order: image.order,
          width: image.width,
          height: image.height,
        })),
      },
    });
  }

  async delete(id: string, userId: string, role: string): Promise<boolean> {
    const furniture = await this.getOwned(id, userId, role);
    if (furniture.status === FurnitureStatus.SOLD) {
      throw new BadRequestException(
        "Las piezas vendidas no se pueden eliminar; archívalas para conservar el historial.",
      );
    }
    await this.repo.softDelete(id);
    return true;
  }

  // ---------------------------------------------------------------------
  // Transiciones de estado
  // ---------------------------------------------------------------------

  async publish(id: string, userId: string, role: string) {
    const furniture = await this.getOwned(id, userId, role);
    this.assertTransition(furniture.status, FurnitureStatus.UNDER_REVIEW);
    this.validation.assertPublishable(furniture);
    return this.repo.setStatus(id, FurnitureStatus.UNDER_REVIEW, {
      rejectionReason: null,
    });
  }

  async unpublish(id: string, userId: string, role: string) {
    const furniture = await this.getOwned(id, userId, role);
    this.assertTransition(furniture.status, FurnitureStatus.DRAFT);
    return this.repo.setStatus(id, FurnitureStatus.DRAFT);
  }

  async reserve(id: string, userId: string, role: string) {
    const furniture = await this.getOwned(id, userId, role);
    this.assertTransition(furniture.status, FurnitureStatus.RESERVED);
    return this.repo.setStatus(id, FurnitureStatus.RESERVED);
  }

  async markSold(id: string, userId: string, role: string) {
    const furniture = await this.getOwned(id, userId, role);
    this.assertTransition(furniture.status, FurnitureStatus.SOLD);
    const result = await this.repo.setStatus(id, FurnitureStatus.SOLD);

    const favoritedBy = await this.prisma.client.favorite.findMany({
      where: { furnitureId: id },
      select: { userId: true },
    });
    await Promise.all(
      favoritedBy.map(({ userId: favoritedUserId }) =>
        this.notifications.create(favoritedUserId, "FURNITURE_SOLD", {
          furnitureId: result.id,
          furnitureTitle: result.title,
          furnitureSlug: result.slug,
        }),
      ),
    );

    return result;
  }

  async archive(id: string, userId: string, role: string) {
    const furniture = await this.getOwned(id, userId, role);
    this.assertTransition(furniture.status, FurnitureStatus.ARCHIVED);
    return this.repo.setStatus(id, FurnitureStatus.ARCHIVED);
  }

  async restore(id: string, userId: string, role: string) {
    const furniture = await this.getOwned(id, userId, role);
    this.assertTransition(furniture.status, FurnitureStatus.DRAFT);
    return this.repo.setStatus(id, FurnitureStatus.DRAFT);
  }

  /** Solo MODERATOR/ADMIN — guard de rol aplicado en el resolver. */
  async approve(id: string) {
    const furniture = await this.repo.findById(id);
    if (!furniture) throw new NotFoundException("Pieza no encontrada.");
    this.assertTransition(furniture.status, FurnitureStatus.PUBLISHED);
    const result = await this.repo.setStatus(id, FurnitureStatus.PUBLISHED);

    await this.notifications.create(result.store.ownerId, "LISTING_APPROVED", {
      furnitureId: result.id,
      furnitureTitle: result.title,
      furnitureSlug: result.slug,
    });

    return result;
  }

  /** Solo MODERATOR/ADMIN — guard de rol aplicado en el resolver. */
  async reject(id: string, reason: string) {
    const furniture = await this.repo.findById(id);
    if (!furniture) throw new NotFoundException("Pieza no encontrada.");
    this.assertTransition(furniture.status, FurnitureStatus.REJECTED);
    const result = await this.repo.setStatus(id, FurnitureStatus.REJECTED, {
      rejectionReason: reason,
    });

    await this.notifications.create(result.store.ownerId, "LISTING_REJECTED", {
      furnitureId: result.id,
      furnitureTitle: result.title,
      furnitureSlug: result.slug,
      reason,
    });

    return result;
  }

  // ---------------------------------------------------------------------
  // Imágenes
  // ---------------------------------------------------------------------

  async attachImage(
    furnitureId: string,
    userId: string,
    role: string,
    buffer: Buffer,
    altText?: string,
  ) {
    const furniture = await this.getOwned(furnitureId, userId, role);
    if (furniture.images.length >= MAX_IMAGES) {
      throw new BadRequestException(
        `Máximo ${MAX_IMAGES} fotografías por pieza.`,
      );
    }

    const stored = await this.storage.storeImage({
      buffer,
      keyPrefix: `furniture/${furnitureId}`,
    });

    const order = await this.repo.nextImageOrder(furnitureId);
    return this.repo.createImage({
      furniture: { connect: { id: furnitureId } },
      url: stored.publicUrl,
      altText: altText?.trim() || furniture.title,
      order,
      width: stored.width,
      height: stored.height,
    });
  }

  async deleteImage(
    imageId: string,
    userId: string,
    role: string,
  ): Promise<boolean> {
    const image = await this.repo.findImageById(imageId);
    if (!image) throw new NotFoundException("Imagen no encontrada.");
    await this.getOwned(image.furnitureId, userId, role);

    await this.storage.deleteObject(keyFromPublicUrl(image.url));
    await this.repo.deleteImage(imageId);
    return true;
  }

  async reorderImages(
    furnitureId: string,
    orderedImageIds: string[],
    userId: string,
    role: string,
  ): Promise<boolean> {
    const furniture = await this.getOwned(furnitureId, userId, role);
    const existingIds = new Set(furniture.images.map((image) => image.id));

    const isSameSet =
      orderedImageIds.length === existingIds.size &&
      orderedImageIds.every((id) => existingIds.has(id));
    if (!isSameSet) {
      throw new BadRequestException(
        "La lista de imágenes no coincide con las de esta pieza.",
      );
    }

    await this.repo.reorderImages(
      orderedImageIds.map((id, index) => ({ id, order: index })),
    );
    return true;
  }

  // ---------------------------------------------------------------------
  // Helpers privados
  // ---------------------------------------------------------------------

  private async getOwned(
    id: string,
    userId: string,
    role: string,
  ): Promise<FurnitureWithRelations> {
    const furniture = await this.repo.findById(id);
    if (!furniture) throw new NotFoundException("Pieza no encontrada.");
    this.assertOwnership(furniture, userId, role);
    return furniture;
  }

  private assertOwnership(
    furniture: FurnitureWithRelations,
    userId: string,
    role: string,
  ): void {
    const isOwner = furniture.store.ownerId === userId;
    const isStaff = role === "ADMIN" || role === "MODERATOR";
    if (!isOwner && !isStaff) {
      throw new ForbiddenException("No tienes acceso a esta pieza.");
    }
  }

  private assertEditable(furniture: FurnitureWithRelations): void {
    const editableStates: FurnitureStatus[] = [
      FurnitureStatus.DRAFT,
      FurnitureStatus.REJECTED,
      FurnitureStatus.UNDER_REVIEW,
    ];
    if (!editableStates.includes(furniture.status)) {
      throw new BadRequestException(
        "Esta pieza no se puede editar en su estado actual.",
      );
    }
  }

  private assertTransition(from: FurnitureStatus, to: FurnitureStatus): void {
    if (!TRANSITIONS[from].includes(to)) {
      throw new BadRequestException(
        `No se puede pasar de "${from}" a "${to}".`,
      );
    }
  }

  private canView(
    furniture: FurnitureWithRelations,
    viewer: Viewer | null,
  ): boolean {
    if (PUBLIC_STATES.includes(furniture.status as FurnitureStatus))
      return true;
    if (!viewer) return false;
    return (
      furniture.store.ownerId === viewer.sub ||
      viewer.role === "ADMIN" ||
      viewer.role === "MODERATOR"
    );
  }

  private buildScalarData(
    input: CreateFurnitureInput | UpdateFurnitureInput,
  ): FurnitureScalarData {
    const data: FurnitureScalarData = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.condition !== undefined) data.condition = input.condition;
    if (input.conditionNotes !== undefined)
      data.conditionNotes = input.conditionNotes;
    if (input.originality !== undefined) data.originality = input.originality;
    if (input.color !== undefined) data.color = input.color;
    if (input.decade !== undefined) data.decade = input.decade;
    if (input.widthCm !== undefined) data.widthCm = input.widthCm;
    if (input.heightCm !== undefined) data.heightCm = input.heightCm;
    if (input.depthCm !== undefined) data.depthCm = input.depthCm;
    if (input.weightKg !== undefined) data.weightKg = input.weightKg;
    if (input.price !== undefined) data.price = input.price;
    if (input.currency !== undefined) data.currency = input.currency;
    if (input.priceType !== undefined) data.priceType = input.priceType;
    if (input.shippingMethods !== undefined)
      data.shippingMethods = input.shippingMethods;
    if (input.locationCity !== undefined)
      data.locationCity = input.locationCity;
    if (input.locationRegion !== undefined)
      data.locationRegion = input.locationRegion;
    return data;
  }
}

/** Forma neutra (ni Create ni Update) para poder reutilizar el mismo builder en ambos flujos. */
interface FurnitureScalarData {
  title?: string;
  description?: string;
  condition?: CreateFurnitureInput["condition"];
  conditionNotes?: string;
  originality?: CreateFurnitureInput["originality"];
  color?: string;
  decade?: number;
  widthCm?: number;
  heightCm?: number;
  depthCm?: number;
  weightKg?: number;
  price?: number;
  currency?: string;
  priceType?: CreateFurnitureInput["priceType"];
  shippingMethods?: CreateFurnitureInput["shippingMethods"];
  locationCity?: string;
  locationRegion?: string;
}

function connectOptional(id?: string) {
  return id ? { connect: { id } } : undefined;
}

function connectManyOptional(ids?: string[]) {
  return ids && ids.length > 0
    ? { connect: ids.map((id) => ({ id })) }
    : undefined;
}

function connectOrDisconnect(id: string | undefined) {
  return id ? { connect: { id } } : { disconnect: true };
}

function keyFromPublicUrl(url: string): string {
  const marker = "/uploads/";
  const index = url.indexOf(marker);
  return index === -1 ? url : url.slice(index + marker.length);
}
