import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Public } from "@/common/decorators/public.decorator";
import { Roles } from "@/common/decorators/roles.decorator";
import { RoleName } from "@/common/graphql/role-name.enum";
import type { AuthTokenPayload } from "@/common/guards/jwt-auth.guard";
import { PublicProfileEntity } from "./entities/public-profile.entity";
import { RoleEntity } from "./entities/role.entity";
import { UserEntity } from "./entities/user.entity";
import { UsersService } from "./users.service";

@Resolver(() => UserEntity)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Query(() => UserEntity, { nullable: true })
  async me(
    @CurrentUser() authUser: AuthTokenPayload | null,
  ): Promise<UserEntity | null> {
    if (!authUser) return null;
    return this.usersService.findById(authUser.sub);
  }

  @Public()
  @Query(() => PublicProfileEntity, { nullable: true })
  async publicProfile(
    @Args("username") username: string,
    @CurrentUser() authUser: AuthTokenPayload | null,
  ): Promise<PublicProfileEntity | null> {
    return this.usersService.findPublicProfile(username, authUser?.sub ?? null);
  }

  @Roles(RoleName.ADMIN)
  @Query(() => [RoleEntity])
  roles(): Promise<RoleEntity[]> {
    return this.usersService.roles();
  }

  @Roles(RoleName.ADMIN)
  @Query(() => [UserEntity])
  adminUsers(
    @Args("search", { nullable: true }) search?: string,
  ): Promise<UserEntity[]> {
    return this.usersService.findManyForAdmin(search);
  }

  @Roles(RoleName.ADMIN)
  @Mutation(() => UserEntity)
  setUserRole(
    @Args("userId") userId: string,
    @Args("role", { type: () => RoleName }) role: RoleName,
  ): Promise<UserEntity> {
    return this.usersService.setRole(userId, role);
  }

  @Roles(RoleName.ADMIN)
  @Mutation(() => UserEntity)
  suspendUser(@Args("userId") userId: string): Promise<UserEntity> {
    return this.usersService.setSuspended(userId, true);
  }

  @Roles(RoleName.ADMIN)
  @Mutation(() => UserEntity)
  restoreUser(@Args("userId") userId: string): Promise<UserEntity> {
    return this.usersService.setSuspended(userId, false);
  }
}
