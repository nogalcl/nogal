import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Roles } from "@/common/decorators/roles.decorator";
import { RoleName } from "@/common/graphql/role-name.enum";
import { ReportStatus } from "@/common/graphql/report-enums";
import type { AuthTokenPayload } from "@/common/guards/jwt-auth.guard";
import { CreateReportInput } from "./dto/create-report.input";
import { ReportEntity } from "./entities/report.entity";
import { ReportsService } from "./reports.service";

@Resolver(() => ReportEntity)
export class ReportsResolver {
  constructor(private readonly reportsService: ReportsService) {}

  @Mutation(() => ReportEntity)
  fileReport(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("input") input: CreateReportInput,
  ): Promise<ReportEntity> {
    return this.reportsService.file(authUser.sub, input);
  }

  @Roles(RoleName.MODERATOR, RoleName.ADMIN)
  @Query(() => [ReportEntity])
  pendingReports(): Promise<ReportEntity[]> {
    return this.reportsService.listPending();
  }

  @Roles(RoleName.MODERATOR, RoleName.ADMIN)
  @Mutation(() => ReportEntity)
  resolveReport(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
    @Args("status", { type: () => ReportStatus }) status: ReportStatus,
  ): Promise<ReportEntity> {
    return this.reportsService.resolve(
      id,
      authUser.sub,
      status as Exclude<ReportStatus, "PENDING">,
    );
  }
}
