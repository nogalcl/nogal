import { Module } from "@nestjs/common";
import { AuditResolver } from "./audit.resolver";
import { AuditService } from "./audit.service";

@Module({
  providers: [AuditService, AuditResolver],
})
export class AuditModule {}
