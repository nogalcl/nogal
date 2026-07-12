import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { StoresService } from "@/modules/stores/stores.service";
import {
  FURNITURE_PREVIEW_SELECT,
  type FurniturePreviewRow,
} from "@/modules/furniture/furniture.repository";
import { toFurniturePreviewEntity } from "@/modules/furniture/furniture.mapper";
import type { CreateCollectionInput } from "./dto/create-collection.input";
import type { CollectionEntity } from "./entities/collection.entity";

const collectionInclude = {
  items: {
    orderBy: { addedAt: "desc" as const },
    select: { furniture: { select: FURNITURE_PREVIEW_SELECT } },
  },
  _count: { select: { items: true } },
};

type CollectionRow = Awaited<
  ReturnType<CollectionsService["findRawById"]>
>;

@Injectable()
export class CollectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storesService: StoresService,
  ) {}

  private findRawById(id: string) {
    return this.prisma.client.collection.findUnique({
      where: { id },
      include: collectionInclude,
    });
  }

  private toEntity(row: NonNullable<CollectionRow>): CollectionEntity {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      storeId: row.storeId,
      itemCount: row._count.items,
      items: row.items.map((item) =>
        toFurniturePreviewEntity(item.furniture as FurniturePreviewRow),
      ),
      createdAt: row.createdAt,
    };
  }

  async create(
    ownerId: string,
    input: CreateCollectionInput,
  ): Promise<CollectionEntity> {
    if (input.storeId) {
      const store = await this.storesService.findById(input.storeId);
      if (!store || store.ownerId !== ownerId) {
        throw new ForbiddenException("No puedes crear colecciones para esa tienda.");
      }
    }

    const created = await this.prisma.client.collection.create({
      data: {
        ownerId,
        storeId: input.storeId,
        name: input.name,
        description: input.description,
      },
      include: collectionInclude,
    });
    return this.toEntity(created);
  }

  async listMine(ownerId: string): Promise<CollectionEntity[]> {
    const rows = await this.prisma.client.collection.findMany({
      where: { ownerId, storeId: null },
      include: collectionInclude,
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => this.toEntity(row));
  }

  async listForStore(storeId: string): Promise<CollectionEntity[]> {
    const rows = await this.prisma.client.collection.findMany({
      where: { storeId },
      include: collectionInclude,
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => this.toEntity(row));
  }

  async rename(
    id: string,
    ownerId: string,
    name: string,
    description?: string,
  ): Promise<CollectionEntity> {
    await this.getOwned(id, ownerId);
    const updated = await this.prisma.client.collection.update({
      where: { id },
      data: { name, description },
      include: collectionInclude,
    });
    return this.toEntity(updated);
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    await this.getOwned(id, ownerId);
    await this.prisma.client.collection.delete({ where: { id } });
    return true;
  }

  async addItem(
    id: string,
    ownerId: string,
    furnitureId: string,
  ): Promise<CollectionEntity> {
    await this.getOwned(id, ownerId);
    await this.prisma.client.collectionItem.upsert({
      where: { collectionId_furnitureId: { collectionId: id, furnitureId } },
      update: {},
      create: { collectionId: id, furnitureId },
    });
    const updated = await this.findRawById(id);
    return this.toEntity(updated!);
  }

  async removeItem(
    id: string,
    ownerId: string,
    furnitureId: string,
  ): Promise<CollectionEntity> {
    await this.getOwned(id, ownerId);
    await this.prisma.client.collectionItem.deleteMany({
      where: { collectionId: id, furnitureId },
    });
    const updated = await this.findRawById(id);
    return this.toEntity(updated!);
  }

  private async getOwned(id: string, ownerId: string) {
    const collection = await this.prisma.client.collection.findUnique({
      where: { id },
    });
    if (!collection) throw new NotFoundException("Colección no encontrada.");
    if (collection.ownerId !== ownerId) {
      throw new ForbiddenException("No tienes acceso a esta colección.");
    }
    return collection;
  }
}
