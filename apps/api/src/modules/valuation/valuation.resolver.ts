import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Roles } from "@/common/decorators/roles.decorator";
import { RoleName } from "@/common/graphql/role-name.enum";
import { ValuationRequestStatus } from "@/common/graphql/valuation-enums";
import type { AuthTokenPayload } from "@/common/guards/jwt-auth.guard";
import { ConversationParticipant } from "@/modules/messaging/entities/conversation.entity";
import { UpdateValuationRequestInput } from "./dto/update-valuation-request.input";
import { ValuationReportInput } from "./dto/valuation-report.input";
import { ValuationRequestEntity } from "./entities/valuation-request.entity";
import { ValuationReportEntity } from "./entities/valuation-report.entity";
import { ValuationReportService } from "./valuation-report.service";
import { ValuationService } from "./valuation.service";

@Resolver(() => ValuationRequestEntity)
export class ValuationResolver {
  constructor(
    private readonly valuationService: ValuationService,
    private readonly reportService: ValuationReportService,
  ) {}

  // --- Solicitante ---

  @Query(() => [ValuationRequestEntity])
  myValuationRequests(
    @CurrentUser() authUser: AuthTokenPayload,
  ): Promise<ValuationRequestEntity[]> {
    return this.valuationService.findMine(authUser);
  }

  @Query(() => ValuationRequestEntity)
  valuationRequest(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
  ): Promise<ValuationRequestEntity> {
    return this.valuationService.findByIdForViewer(id, authUser);
  }

  @Query(() => ValuationReportEntity, { nullable: true })
  valuationReport(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("requestId") requestId: string,
  ): Promise<ValuationReportEntity | null> {
    return this.reportService.findByRequestId(requestId, authUser);
  }

  @Mutation(() => ValuationRequestEntity)
  startValuationRequest(
    @CurrentUser() authUser: AuthTokenPayload,
  ): Promise<ValuationRequestEntity> {
    return this.valuationService.create(authUser);
  }

  @Mutation(() => ValuationRequestEntity)
  updateValuationRequest(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("input") input: UpdateValuationRequestInput,
  ): Promise<ValuationRequestEntity> {
    return this.valuationService.updateInfo(input, authUser);
  }

  @Mutation(() => ValuationRequestEntity)
  simulateValuationPayment(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
  ): Promise<ValuationRequestEntity> {
    return this.valuationService.simulatePayment(id, authUser);
  }

  @Mutation(() => ValuationRequestEntity)
  cancelValuationRequest(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
  ): Promise<ValuationRequestEntity> {
    return this.valuationService.cancel(id, authUser);
  }

  @Mutation(() => Boolean)
  deleteValuationRequestImage(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
  ): Promise<boolean> {
    return this.valuationService.deleteImage(id, authUser);
  }

  // --- Panel experto ---

  @Roles(RoleName.MODERATOR, RoleName.ADMIN)
  @Query(() => [ConversationParticipant])
  valuationExperts(): Promise<ConversationParticipant[]> {
    return this.valuationService.listExperts();
  }

  @Roles(RoleName.MODERATOR, RoleName.ADMIN)
  @Query(() => [ValuationRequestEntity])
  valuationRequestsForStaff(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("status", { type: () => ValuationRequestStatus, nullable: true })
    status?: ValuationRequestStatus,
    @Args("assignedToMe", { nullable: true }) assignedToMe?: boolean,
  ): Promise<ValuationRequestEntity[]> {
    return this.valuationService.findForStaff({ status, assignedToMe }, authUser);
  }

  @Roles(RoleName.MODERATOR, RoleName.ADMIN)
  @Mutation(() => ValuationRequestEntity)
  assignValuationExpert(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("requestId") requestId: string,
    @Args("expertId") expertId: string,
  ): Promise<ValuationRequestEntity> {
    return this.valuationService.assignExpert(requestId, expertId, authUser);
  }

  @Roles(RoleName.MODERATOR, RoleName.ADMIN)
  @Mutation(() => ValuationRequestEntity)
  setValuationRequestStatus(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("requestId") requestId: string,
    @Args("status", { type: () => ValuationRequestStatus })
    status: ValuationRequestStatus,
  ): Promise<ValuationRequestEntity> {
    return this.valuationService.setStatus(requestId, status, authUser);
  }

  @Roles(RoleName.MODERATOR, RoleName.ADMIN)
  @Mutation(() => ValuationRequestEntity)
  addValuationComment(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("requestId") requestId: string,
    @Args("body") body: string,
  ): Promise<ValuationRequestEntity> {
    return this.valuationService.addComment(requestId, body, authUser);
  }

  @Roles(RoleName.MODERATOR, RoleName.ADMIN)
  @Mutation(() => ValuationReportEntity)
  createValuationReport(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("input") input: ValuationReportInput,
  ): Promise<ValuationReportEntity> {
    return this.reportService.create(input, authUser);
  }

  @Roles(RoleName.MODERATOR, RoleName.ADMIN)
  @Mutation(() => ValuationReportEntity)
  updateValuationReport(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("input") input: ValuationReportInput,
  ): Promise<ValuationReportEntity> {
    return this.reportService.update(input, authUser);
  }
}
