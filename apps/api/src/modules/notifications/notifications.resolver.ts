import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import type { AuthTokenPayload } from "@/common/guards/jwt-auth.guard";
import { NotificationConnection } from "./entities/notification-connection.entity";
import { NotificationsService } from "./notifications.service";

@Resolver()
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Query(() => NotificationConnection)
  myNotifications(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("page", { type: () => Int, nullable: true }) page?: number,
  ): Promise<NotificationConnection> {
    return this.notificationsService.findForUser(authUser.sub, page);
  }

  @Mutation(() => Boolean)
  markNotificationRead(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
  ): Promise<boolean> {
    return this.notificationsService.markRead(id, authUser.sub);
  }

  @Mutation(() => Boolean)
  markAllNotificationsRead(
    @CurrentUser() authUser: AuthTokenPayload,
  ): Promise<boolean> {
    return this.notificationsService.markAllRead(authUser.sub);
  }
}
