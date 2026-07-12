import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import type { AuthTokenPayload } from "@/common/guards/jwt-auth.guard";
import { BlocksService } from "./blocks.service";
import { FollowsService } from "./follows.service";

@Resolver()
export class SocialResolver {
  constructor(
    private readonly followsService: FollowsService,
    private readonly blocksService: BlocksService,
  ) {}

  @Mutation(() => Boolean)
  followUser(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("userId") userId: string,
  ): Promise<boolean> {
    return this.followsService.follow(authUser.sub, userId);
  }

  @Mutation(() => Boolean)
  unfollowUser(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("userId") userId: string,
  ): Promise<boolean> {
    return this.followsService.unfollow(authUser.sub, userId);
  }

  @Query(() => Boolean)
  amIFollowing(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("userId") userId: string,
  ): Promise<boolean> {
    return this.followsService.isFollowing(authUser.sub, userId);
  }

  @Mutation(() => Boolean)
  blockUser(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("userId") userId: string,
  ): Promise<boolean> {
    return this.blocksService.block(authUser.sub, userId);
  }

  @Mutation(() => Boolean)
  unblockUser(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("userId") userId: string,
  ): Promise<boolean> {
    return this.blocksService.unblock(authUser.sub, userId);
  }
}
