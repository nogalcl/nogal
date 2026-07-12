import { Module } from "@nestjs/common";
import { StoresModule } from "@/modules/stores/stores.module";
import { NotificationsModule } from "@/modules/notifications/notifications.module";
import { FurnitureImagesController } from "./furniture-images.controller";
import { FurnitureRepository } from "./furniture.repository";
import { FurnitureResolver } from "./furniture.resolver";
import { FurnitureService } from "./furniture.service";
import { FurnitureValidationService } from "./furniture.validation";

@Module({
  imports: [StoresModule, NotificationsModule],
  controllers: [FurnitureImagesController],
  providers: [
    FurnitureRepository,
    FurnitureValidationService,
    FurnitureService,
    FurnitureResolver,
  ],
})
export class FurnitureModule {}
