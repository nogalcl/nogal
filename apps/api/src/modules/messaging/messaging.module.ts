import { Module } from "@nestjs/common";
import { NotificationsModule } from "@/modules/notifications/notifications.module";
import { SocialModule } from "@/modules/social/social.module";
import { MessagingResolver } from "./messaging.resolver";
import { MessagingService } from "./messaging.service";

@Module({
  imports: [NotificationsModule, SocialModule],
  providers: [MessagingService, MessagingResolver],
  exports: [MessagingService],
})
export class MessagingModule {}
