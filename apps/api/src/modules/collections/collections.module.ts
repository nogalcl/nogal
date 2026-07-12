import { Module } from "@nestjs/common";
import { StoresModule } from "@/modules/stores/stores.module";
import { CollectionsResolver } from "./collections.resolver";
import { CollectionsService } from "./collections.service";

@Module({
  imports: [StoresModule],
  providers: [CollectionsService, CollectionsResolver],
  exports: [CollectionsService],
})
export class CollectionsModule {}
