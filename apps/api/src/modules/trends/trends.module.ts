import { Module } from "@nestjs/common";
import { TrendsResolver } from "./trends.resolver";
import { TrendsService } from "./trends.service";

@Module({
  providers: [TrendsService, TrendsResolver],
})
export class TrendsModule {}
