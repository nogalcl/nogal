import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Env } from "@/config/env.validation";
import { LocalDiskStorageProvider } from "./providers/local-disk-storage.provider";
import { R2StorageProvider } from "./providers/r2-storage.provider";
import { STORAGE_PROVIDER } from "./storage.interface";

@Global()
@Module({
  providers: [
    LocalDiskStorageProvider,
    R2StorageProvider,
    {
      provide: STORAGE_PROVIDER,
      useFactory: (
        configService: ConfigService<Env, true>,
        local: LocalDiskStorageProvider,
        r2: R2StorageProvider,
      ) => (configService.get("STORAGE_PROVIDER") === "r2" ? r2 : local),
      inject: [ConfigService, LocalDiskStorageProvider, R2StorageProvider],
    },
  ],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
