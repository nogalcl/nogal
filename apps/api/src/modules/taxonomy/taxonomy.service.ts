import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import type {
  CategoryEntity,
  DecadeEntity,
  DesignerEntity,
  ManufacturerEntity,
  MaterialEntity,
  StyleEntity,
  WoodTypeEntity,
} from "@/modules/furniture/entities/taxonomy.entity";
import type { CountryDetailEntity } from "@/modules/users/entities/country.entity";
import {
  countRelatedFurniture,
  relatedDesignersFor,
  relatedManufacturersFor,
  relatedMaterialsFor,
  relatedStylesFor,
  valuationMentionCount,
} from "./taxonomy-related.query";

@Injectable()
export class TaxonomyService {
  constructor(private readonly prisma: PrismaService) {}

  categories() {
    return this.prisma.client.category.findMany({ orderBy: { name: "asc" } });
  }

  materials() {
    return this.prisma.client.material.findMany({ orderBy: { name: "asc" } });
  }

  woodTypes() {
    return this.prisma.client.woodType.findMany({ orderBy: { name: "asc" } });
  }

  styles() {
    return this.prisma.client.style.findMany({ orderBy: { name: "asc" } });
  }

  designers() {
    return this.prisma.client.designer.findMany({
      orderBy: { name: "asc" },
      include: { country: true },
    });
  }

  manufacturers() {
    return this.prisma.client.manufacturer.findMany({
      orderBy: { name: "asc" },
      include: { country: true },
    });
  }

  countries() {
    return this.prisma.client.country.findMany({ orderBy: { name: "asc" } });
  }

  decades() {
    return this.prisma.client.decade.findMany({ orderBy: { value: "asc" } });
  }

  async categoryBySlug(slug: string): Promise<CategoryEntity | null> {
    const category = await this.prisma.client.category.findUnique({ where: { slug } });
    if (!category) return null;
    const where = { categoryId: category.id };
    const [pieceCount, relatedDesigners, relatedMaterials] = await Promise.all([
      countRelatedFurniture(this.prisma, where),
      relatedDesignersFor(this.prisma, where),
      relatedMaterialsFor(this.prisma, where),
    ]);
    return { ...category, pieceCount, relatedDesigners, relatedMaterials };
  }

  async materialBySlug(slug: string): Promise<MaterialEntity | null> {
    const material = await this.prisma.client.material.findUnique({ where: { slug } });
    if (!material) return null;
    const where = { materials: { some: { id: material.id } } };
    const [pieceCount, relatedDesigners, relatedManufacturers, mentions] = await Promise.all([
      countRelatedFurniture(this.prisma, where),
      relatedDesignersFor(this.prisma, where),
      relatedManufacturersFor(this.prisma, where),
      valuationMentionCount(this.prisma, { materials: { some: { id: material.id } } }),
    ]);
    return {
      ...material,
      pieceCount,
      relatedDesigners,
      relatedManufacturers,
      valuationMentionCount: mentions,
    };
  }

  async woodTypeBySlug(slug: string): Promise<WoodTypeEntity | null> {
    const woodType = await this.prisma.client.woodType.findUnique({ where: { slug } });
    if (!woodType) return null;
    const where = { woodTypes: { some: { id: woodType.id } } };
    const [pieceCount, relatedDesigners, relatedManufacturers, mentions] = await Promise.all([
      countRelatedFurniture(this.prisma, where),
      relatedDesignersFor(this.prisma, where),
      relatedManufacturersFor(this.prisma, where),
      valuationMentionCount(this.prisma, { woodTypes: { some: { id: woodType.id } } }),
    ]);
    return {
      ...woodType,
      pieceCount,
      relatedDesigners,
      relatedManufacturers,
      valuationMentionCount: mentions,
    };
  }

  async styleBySlug(slug: string): Promise<StyleEntity | null> {
    const style = await this.prisma.client.style.findUnique({ where: { slug } });
    if (!style) return null;
    const where = { styleId: style.id };
    const [pieceCount, relatedDesigners, relatedManufacturers, mentions] = await Promise.all([
      countRelatedFurniture(this.prisma, where),
      relatedDesignersFor(this.prisma, where),
      relatedManufacturersFor(this.prisma, where),
      valuationMentionCount(this.prisma, { styleId: style.id }),
    ]);
    return {
      ...style,
      pieceCount,
      relatedDesigners,
      relatedManufacturers,
      valuationMentionCount: mentions,
    };
  }

  async designerBySlug(slug: string): Promise<DesignerEntity | null> {
    const designer = await this.prisma.client.designer.findUnique({
      where: { slug },
      include: { country: true },
    });
    if (!designer) return null;
    const where = { designerId: designer.id };
    const [pieceCount, relatedMaterials, relatedStyles, mentions] = await Promise.all([
      countRelatedFurniture(this.prisma, where),
      relatedMaterialsFor(this.prisma, where),
      relatedStylesFor(this.prisma, where),
      valuationMentionCount(this.prisma, { designerId: designer.id }),
    ]);
    return {
      ...designer,
      pieceCount,
      relatedMaterials,
      relatedStyles,
      valuationMentionCount: mentions,
    };
  }

  async manufacturerBySlug(slug: string): Promise<ManufacturerEntity | null> {
    const manufacturer = await this.prisma.client.manufacturer.findUnique({
      where: { slug },
      include: { country: true },
    });
    if (!manufacturer) return null;
    const where = { manufacturerId: manufacturer.id };
    const [pieceCount, relatedMaterials, relatedStyles, mentions] = await Promise.all([
      countRelatedFurniture(this.prisma, where),
      relatedMaterialsFor(this.prisma, where),
      relatedStylesFor(this.prisma, where),
      valuationMentionCount(this.prisma, { manufacturerId: manufacturer.id }),
    ]);
    return {
      ...manufacturer,
      pieceCount,
      relatedMaterials,
      relatedStyles,
      valuationMentionCount: mentions,
    };
  }

  async countryBySlug(slug: string): Promise<CountryDetailEntity | null> {
    const country = await this.prisma.client.country.findUnique({ where: { slug } });
    if (!country) return null;
    const where = { originCountryId: country.id };
    const [pieceCount, relatedDesigners, relatedManufacturers] = await Promise.all([
      countRelatedFurniture(this.prisma, where),
      relatedDesignersFor(this.prisma, where),
      relatedManufacturersFor(this.prisma, where),
    ]);
    return { ...country, pieceCount, relatedDesigners, relatedManufacturers };
  }

  async decadeByValue(value: number): Promise<DecadeEntity | null> {
    const decade = await this.prisma.client.decade.findUnique({ where: { value } });
    if (!decade) return null;
    const where = { decade: value };
    const [pieceCount, relatedDesigners, relatedMaterials, relatedStyles] = await Promise.all([
      countRelatedFurniture(this.prisma, where),
      relatedDesignersFor(this.prisma, where),
      relatedMaterialsFor(this.prisma, where),
      relatedStylesFor(this.prisma, where),
    ]);
    return { ...decade, pieceCount, relatedDesigners, relatedMaterials, relatedStyles };
  }
}
