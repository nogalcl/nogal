import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Public } from "@/common/decorators/public.decorator";
import { Roles } from "@/common/decorators/roles.decorator";
import { RoleName } from "@/common/graphql/role-name.enum";
import type { AuthTokenPayload } from "@/common/guards/jwt-auth.guard";
import { CreateStoreInput } from "./dto/create-store.input";
import { UpdateStoreInput } from "./dto/update-store.input";
import { StoreEntity } from "./entities/store.entity";
import { StoresService } from "./stores.service";

@Resolver(() => StoreEntity)
export class StoresResolver {
  constructor(private readonly storesService: StoresService) {}

  @Query(() => StoreEntity, { nullable: true })
  async myStore(
    @CurrentUser() authUser: AuthTokenPayload,
  ): Promise<StoreEntity | null> {
    return this.storesService.findByOwnerId(authUser.sub);
  }

  @Public()
  @Query(() => StoreEntity, { nullable: true })
  async storeBySlug(@Args("slug") slug: string): Promise<StoreEntity | null> {
    return this.storesService.findEntityBySlug(slug);
  }

  @Public()
  @Query(() => [StoreEntity])
  async stores(): Promise<StoreEntity[]> {
    return this.storesService.findManyPublished();
  }

  @Mutation(() => StoreEntity)
  async updateStore(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("input") input: UpdateStoreInput,
  ): Promise<StoreEntity> {
    return this.storesService.update(authUser.sub, input);
  }

  @Mutation(() => StoreEntity)
  async createStore(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("input") input: CreateStoreInput,
  ): Promise<StoreEntity> {
    return this.storesService.create(authUser.sub, input.name);
  }

  @Roles(RoleName.MODERATOR, RoleName.ADMIN)
  @Mutation(() => StoreEntity)
  async verifyStore(@Args("id") id: string): Promise<StoreEntity> {
    return this.storesService.setVerified(id, true);
  }

  @Roles(RoleName.MODERATOR, RoleName.ADMIN)
  @Mutation(() => StoreEntity)
  async unverifyStore(@Args("id") id: string): Promise<StoreEntity> {
    return this.storesService.setVerified(id, false);
  }

  @Roles(RoleName.MODERATOR, RoleName.ADMIN)
  @Query(() => [StoreEntity])
  storesForAdmin(
    @Args("search", { nullable: true }) search?: string,
  ): Promise<StoreEntity[]> {
    return this.storesService.findManyForAdmin(search);
  }
}
