import { Args, Int, Query, Resolver } from "@nestjs/graphql";
import { Public } from "@/common/decorators/public.decorator";
import {
  CategoryEntity,
  DecadeEntity,
  DesignerEntity,
  ManufacturerEntity,
  MaterialEntity,
  StyleEntity,
  WoodTypeEntity,
} from "@/modules/furniture/entities/taxonomy.entity";
import { CountryDetailEntity, CountryEntity } from "@/modules/users/entities/country.entity";
import { TaxonomyService } from "./taxonomy.service";

@Resolver()
export class TaxonomyResolver {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  @Public()
  @Query(() => [CategoryEntity])
  categories() {
    return this.taxonomyService.categories();
  }

  @Public()
  @Query(() => [MaterialEntity])
  materials() {
    return this.taxonomyService.materials();
  }

  @Public()
  @Query(() => [WoodTypeEntity])
  woodTypes() {
    return this.taxonomyService.woodTypes();
  }

  @Public()
  @Query(() => [StyleEntity])
  styles() {
    return this.taxonomyService.styles();
  }

  @Public()
  @Query(() => [DesignerEntity])
  designers() {
    return this.taxonomyService.designers();
  }

  @Public()
  @Query(() => [ManufacturerEntity])
  manufacturers() {
    return this.taxonomyService.manufacturers();
  }

  @Public()
  @Query(() => [CountryEntity])
  countries() {
    return this.taxonomyService.countries();
  }

  @Public()
  @Query(() => [DecadeEntity])
  decades() {
    return this.taxonomyService.decades();
  }

  @Public()
  @Query(() => CategoryEntity, { nullable: true })
  categoryBySlug(@Args("slug") slug: string) {
    return this.taxonomyService.categoryBySlug(slug);
  }

  @Public()
  @Query(() => MaterialEntity, { nullable: true })
  materialBySlug(@Args("slug") slug: string) {
    return this.taxonomyService.materialBySlug(slug);
  }

  @Public()
  @Query(() => WoodTypeEntity, { nullable: true })
  woodTypeBySlug(@Args("slug") slug: string) {
    return this.taxonomyService.woodTypeBySlug(slug);
  }

  @Public()
  @Query(() => StyleEntity, { nullable: true })
  styleBySlug(@Args("slug") slug: string) {
    return this.taxonomyService.styleBySlug(slug);
  }

  @Public()
  @Query(() => DesignerEntity, { nullable: true })
  designerBySlug(@Args("slug") slug: string) {
    return this.taxonomyService.designerBySlug(slug);
  }

  @Public()
  @Query(() => ManufacturerEntity, { nullable: true })
  manufacturerBySlug(@Args("slug") slug: string) {
    return this.taxonomyService.manufacturerBySlug(slug);
  }

  @Public()
  @Query(() => CountryDetailEntity, { nullable: true })
  countryBySlug(@Args("slug") slug: string) {
    return this.taxonomyService.countryBySlug(slug);
  }

  @Public()
  @Query(() => DecadeEntity, { nullable: true })
  decadeByValue(@Args("value", { type: () => Int }) value: number) {
    return this.taxonomyService.decadeByValue(value);
  }
}
