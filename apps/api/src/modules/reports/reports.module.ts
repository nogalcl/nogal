import { Module } from "@nestjs/common";
import { NotificationsModule } from "@/modules/notifications/notifications.module";
import { ReportsResolver } from "./reports.resolver";
import { ReportsService } from "./reports.service";

@Module({
  imports: [NotificationsModule],
  providers: [ReportsService, ReportsResolver],
  exports: [ReportsService],
})
export class ReportsModule {}
