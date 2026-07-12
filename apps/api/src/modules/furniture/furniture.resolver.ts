import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Public } from "@/common/decorators/public.decorator";
import { Roles } from "@/common/decorators/roles.decorator";
import type { AuthTokenPayload } from "@/common/guards/jwt-auth.guard";
import { RoleName } from "@/common/graphql/role-name.enum";
import { FurnitureSort, FurnitureStatus } from "@/common/graphql/furniture-enums";
import { CreateFurnitureInput } from "./dto/create-furniture.input";
import { FurnitureFilterInput } from "./dto/furniture-filter.input";
import { RejectFurnitureInput } from "./dto/reject-furniture.input";
import { UpdateFurnitureInput } from "./dto/update-furniture.input";
import { FurnitureConnection } from "./entities/furniture-connection.entity";
import { FurnitureEntity } from "./entities/furniture.entity";
import { FurnitureService } from "./furniture.service";
import {
  toFurnitureEntity,
  toFurniturePreviewEntity,
} from "./furniture.mapper";

@Resolver(() => FurnitureEntity)
export class FurnitureResolver {
  constructor(private readonly furnitureService: FurnitureService) {}

  @Public()
  @Query(() => FurnitureEntity, { nullable: true })
  async furniture(
    @Args("slug") slug: string,
    @CurrentUser() viewer: AuthTokenPayload | null,
  ): Promise<FurnitureEntity | null> {
    const found = await this.furnitureService.findBySlugForViewer(slug, viewer);
    if (!found) return null;

    if (!viewer || found.store.ownerId !== viewer.sub) {
      await this.furnitureService.registerView(found.id);
    }

    return toFurnitureEntity(found);
  }

  @Public()
  @Query(() => FurnitureConnection)
  async exploreFurniture(
    @Args("filter", { nullable: true }) filter?: FurnitureFilterInput,
    @Args("sort", { type: () => FurnitureSort, nullable: true })
    sort?: FurnitureSort,
  ): Promise<FurnitureConnection> {
    const { items, total, page, perPage } = await this.furnitureService.explore(
      filter,
      sort,
    );
    return {
      items: items.map(toFurniturePreviewEntity),
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    };
  }

  @Public()
  @Query(() => [String])
  furnitureLocations(): Promise<string[]> {
    return this.furnitureService.locations();
  }

  @Roles(RoleName.MODERATOR, RoleName.ADMIN)
  @Query(() => [FurnitureEntity])
  async furnitureForModeration(
    @Args("status", { type: () => FurnitureStatus, nullable: true })
    status?: FurnitureStatus,
  ): Promise<FurnitureEntity[]> {
    const pieces = await this.furnitureService.findForModeration(status);
    return pieces.map(toFurnitureEntity);
  }

  @Query(() => [FurnitureEntity])
  async myFurniture(
    @CurrentUser() authUser: AuthTokenPayload,
  ): Promise<FurnitureEntity[]> {
    const pieces = await this.furnitureService.findMine(authUser.sub);
    return pieces.map(toFurnitureEntity);
  }

  @Query(() => FurnitureEntity)
  async furnitureById(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
  ): Promise<FurnitureEntity> {
    const found = await this.furnitureService.findByIdForOwner(
      id,
      authUser.sub,
      authUser.role,
    );
    return toFurnitureEntity(found);
  }

  @Mutation(() => FurnitureEntity)
  async createFurniture(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("input") input: CreateFurnitureInput,
  ): Promise<FurnitureEntity> {
    const created = await this.furnitureService.create(authUser.sub, input);
    return toFurnitureEntity(created);
  }

  @Mutation(() => FurnitureEntity)
  async updateFurniture(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("input") input: UpdateFurnitureInput,
  ): Promise<FurnitureEntity> {
    const updated = await this.furnitureService.update(
      authUser.sub,
      authUser.role,
      input,
    );
    return toFurnitureEntity(updated);
  }

  @Mutation(() => FurnitureEntity)
  async duplicateFurniture(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
  ): Promise<FurnitureEntity> {
    const duplicated = await this.furnitureService.duplicate(
      id,
      authUser.sub,
      authUser.role,
    );
    return toFurnitureEntity(duplicated);
  }

  @Mutation(() => Boolean)
  async deleteFurniture(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
  ): Promise<boolean> {
    return this.furnitureService.delete(id, authUser.sub, authUser.role);
  }

  @Mutation(() => FurnitureEntity)
  async publishFurniture(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
  ): Promise<FurnitureEntity> {
    const result = await this.furnitureService.publish(
      id,
      authUser.sub,
      authUser.role,
    );
    return toFurnitureEntity(result);
  }

  @Mutation(() => FurnitureEntity)
  async unpublishFurniture(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
  ): Promise<FurnitureEntity> {
    const result = await this.furnitureService.unpublish(
      id,
      authUser.sub,
      authUser.role,
    );
    return toFurnitureEntity(result);
  }

  @Mutation(() => FurnitureEntity)
  async reserveFurniture(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
  ): Promise<FurnitureEntity> {
    const result = await this.furnitureService.reserve(
      id,
      authUser.sub,
      authUser.role,
    );
    return toFurnitureEntity(result);
  }

  @Mutation(() => FurnitureEntity)
  async markFurnitureSold(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
  ): Promise<FurnitureEntity> {
    const result = await this.furnitureService.markSold(
      id,
      authUser.sub,
      authUser.role,
    );
    return toFurnitureEntity(result);
  }

  @Mutation(() => FurnitureEntity)
  async archiveFurniture(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
  ): Promise<FurnitureEntity> {
    const result = await this.furnitureService.archive(
      id,
      authUser.sub,
      authUser.role,
    );
    return toFurnitureEntity(result);
  }

  @Mutation(() => FurnitureEntity)
  async restoreFurniture(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
  ): Promise<FurnitureEntity> {
    const result = await this.furnitureService.restore(
      id,
      authUser.sub,
      authUser.role,
    );
    return toFurnitureEntity(result);
  }

  @Roles(RoleName.MODERATOR, RoleName.ADMIN)
  @Mutation(() => FurnitureEntity)
  async approveFurniture(@Args("id") id: string): Promise<FurnitureEntity> {
    const result = await this.furnitureService.approve(id);
    return toFurnitureEntity(result);
  }

  @Roles(RoleName.MODERATOR, RoleName.ADMIN)
  @Mutation(() => FurnitureEntity)
  async rejectFurniture(
    @Args("input") input: RejectFurnitureInput,
  ): Promise<FurnitureEntity> {
    const result = await this.furnitureService.reject(input.id, input.reason);
    return toFurnitureEntity(result);
  }

  @Mutation(() => Boolean)
  async reorderFurnitureImages(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("furnitureId") furnitureId: string,
    @Args({ name: "imageIds", type: () => [String] }) imageIds: string[],
  ): Promise<boolean> {
    return this.furnitureService.reorderImages(
      furnitureId,
      imageIds,
      authUser.sub,
      authUser.role,
    );
  }

  @Mutation(() => Boolean)
  async deleteFurnitureImage(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
  ): Promise<boolean> {
    return this.furnitureService.deleteImage(id, authUser.sub, authUser.role);
  }
}
