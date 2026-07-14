import { Module } from "@nestjs/common";
import { RestorerRepository } from "./restorer.repository";
import { RestorerResolver } from "./restorer.resolver";
import { RestorerService } from "./restorer.service";

@Module({
  providers: [RestorerRepository, RestorerService, RestorerResolver],
})
export class RestorerModule {}
