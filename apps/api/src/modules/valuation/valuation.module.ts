import { Module } from "@nestjs/common";
import { NotificationsModule } from "@/modules/notifications/notifications.module";
import { ValuationAiModule } from "./ai/valuation-ai.module";
import { ValuationImagesController } from "./valuation-images.controller";
import { ValuationReportService } from "./valuation-report.service";
import { ValuationRepository } from "./valuation.repository";
import { ValuationResolver } from "./valuation.resolver";
import { ValuationService } from "./valuation.service";

@Module({
  imports: [NotificationsModule, ValuationAiModule],
  controllers: [ValuationImagesController],
  providers: [
    ValuationRepository,
    ValuationService,
    ValuationReportService,
    ValuationResolver,
  ],
})
export class ValuationModule {}
