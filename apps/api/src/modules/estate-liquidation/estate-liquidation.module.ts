import { Module } from "@nestjs/common";
import { NotificationsModule } from "@/modules/notifications/notifications.module";
import { EstateLiquidationImagesController } from "./estate-liquidation-images.controller";
import { EstateLiquidationRepository } from "./estate-liquidation.repository";
import { EstateLiquidationResolver } from "./estate-liquidation.resolver";
import { EstateLiquidationService } from "./estate-liquidation.service";

@Module({
  imports: [NotificationsModule],
  controllers: [EstateLiquidationImagesController],
  providers: [
    EstateLiquidationRepository,
    EstateLiquidationService,
    EstateLiquidationResolver,
  ],
})
export class EstateLiquidationModule {}
