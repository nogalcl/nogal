import { Args, Query, Resolver } from "@nestjs/graphql";
import { Roles } from "@/common/decorators/roles.decorator";
import { RoleName } from "@/common/graphql/role-name.enum";
import { AuditLogEntity } from "./entities/audit-log.entity";
import { AuditService } from "./audit.service";

@Resolver()
export class AuditResolver {
  constructor(private readonly auditService: AuditService) {}

  @Roles(RoleName.ADMIN)
  @Query(() => [AuditLogEntity])
  auditLogs(
    @Args("targetType", { nullable: true }) targetType?: string,
  ): Promise<AuditLogEntity[]> {
    return this.auditService.findRecent(targetType);
  }
}
