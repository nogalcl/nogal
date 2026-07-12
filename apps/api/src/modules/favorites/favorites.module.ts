import { Module } from "@nestjs/common";
import { NotificationsModule } from "@/modules/notifications/notifications.module";
import { FavoritesResolver } from "./favorites.resolver";
import { FavoritesService } from "./favorites.service";

@Module({
  imports: [NotificationsModule],
  providers: [FavoritesService, FavoritesResolver],
  exports: [FavoritesService],
})
export class FavoritesModule {}
