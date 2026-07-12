import { Module } from "@nestjs/common";
import { NotificationsModule } from "@/modules/notifications/notifications.module";
import { BlocksService } from "./blocks.service";
import { FollowsService } from "./follows.service";
import { SocialResolver } from "./social.resolver";

@Module({
  imports: [NotificationsModule],
  providers: [FollowsService, BlocksService, SocialResolver],
  exports: [FollowsService, BlocksService],
})
export class SocialModule {}
