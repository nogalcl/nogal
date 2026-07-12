import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Public } from "@/common/decorators/public.decorator";
import type { AuthTokenPayload } from "@/common/guards/jwt-auth.guard";
import { CollectionsService } from "./collections.service";
import { CreateCollectionInput } from "./dto/create-collection.input";
import { CollectionEntity } from "./entities/collection.entity";

@Resolver(() => CollectionEntity)
export class CollectionsResolver {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Query(() => [CollectionEntity])
  myCollections(
    @CurrentUser() authUser: AuthTokenPayload,
  ): Promise<CollectionEntity[]> {
    return this.collectionsService.listMine(authUser.sub);
  }

  @Public()
  @Query(() => [CollectionEntity])
  storeCollections(
    @Args("storeId") storeId: string,
  ): Promise<CollectionEntity[]> {
    return this.collectionsService.listForStore(storeId);
  }

  @Mutation(() => CollectionEntity)
  createCollection(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("input") input: CreateCollectionInput,
  ): Promise<CollectionEntity> {
    return this.collectionsService.create(authUser.sub, input);
  }

  @Mutation(() => CollectionEntity)
  renameCollection(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
    @Args("name") name: string,
    @Args("description", { nullable: true }) description?: string,
  ): Promise<CollectionEntity> {
    return this.collectionsService.rename(id, authUser.sub, name, description);
  }

  @Mutation(() => Boolean)
  deleteCollection(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
  ): Promise<boolean> {
    return this.collectionsService.delete(id, authUser.sub);
  }

  @Mutation(() => CollectionEntity)
  addToCollection(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
    @Args("furnitureId") furnitureId: string,
  ): Promise<CollectionEntity> {
    return this.collectionsService.addItem(id, authUser.sub, furnitureId);
  }

  @Mutation(() => CollectionEntity)
  removeFromCollection(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
    @Args("furnitureId") furnitureId: string,
  ): Promise<CollectionEntity> {
    return this.collectionsService.removeItem(id, authUser.sub, furnitureId);
  }
}
