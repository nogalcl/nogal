import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import type { AuthTokenPayload } from "@/common/guards/jwt-auth.guard";
import { FavoriteConnection } from "./entities/favorite-connection.entity";
import { FavoritesService } from "./favorites.service";

@Resolver()
export class FavoritesResolver {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Query(() => FavoriteConnection)
  myFavorites(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("page", { type: () => Int, nullable: true }) page?: number,
  ): Promise<FavoriteConnection> {
    return this.favoritesService.listForUser(authUser.sub, page);
  }

  @Query(() => Boolean)
  isFavorited(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("furnitureId") furnitureId: string,
  ): Promise<boolean> {
    return this.favoritesService.isFavorited(authUser.sub, furnitureId);
  }

  @Mutation(() => Boolean)
  addFavorite(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("furnitureId") furnitureId: string,
  ): Promise<boolean> {
    return this.favoritesService.add(authUser.sub, furnitureId);
  }

  @Mutation(() => Boolean)
  removeFavorite(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("furnitureId") furnitureId: string,
  ): Promise<boolean> {
    return this.favoritesService.remove(authUser.sub, furnitureId);
  }
}
