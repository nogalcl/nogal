import { Module } from "@nestjs/common";
import { StoresResolver } from "./stores.resolver";
import { StoresService } from "./stores.service";

@Module({
  providers: [StoresService, StoresResolver],
  exports: [StoresService],
})
export class StoresModule {}
