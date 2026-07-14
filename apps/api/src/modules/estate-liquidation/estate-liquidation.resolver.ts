import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Roles } from "@/common/decorators/roles.decorator";
import { RoleName } from "@/common/graphql/role-name.enum";
import { EstateLiquidationRequestStatus } from "@/common/graphql/estate-liquidation-enums";
import type { AuthTokenPayload } from "@/common/guards/jwt-auth.guard";
import { ConversationParticipant } from "@/modules/messaging/entities/conversation.entity";
import { UpdateEstateLiquidationRequestInput } from "./dto/update-estate-liquidation-request.input";
import {
  CreateEstateLiquidationPieceInput,
  UpdateEstateLiquidationPieceInput,
} from "./dto/estate-liquidation-piece.input";
import { ClassifyPieceInput } from "./dto/classify-piece.input";
import { EstateLiquidationRequestEntity } from "./entities/estate-liquidation-request.entity";
import { EstateLiquidationService } from "./estate-liquidation.service";

@Resolver(() => EstateLiquidationRequestEntity)
export class EstateLiquidationResolver {
  constructor(private readonly service: EstateLiquidationService) {}

  // --- Solicitante ---

  @Query(() => [EstateLiquidationRequestEntity])
  myEstateLiquidationRequests(
    @CurrentUser() authUser: AuthTokenPayload,
  ): Promise<EstateLiquidationRequestEntity[]> {
    return this.service.findMine(authUser);
  }

  @Query(() => EstateLiquidationRequestEntity)
  estateLiquidationRequest(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
  ): Promise<EstateLiquidationRequestEntity> {
    return this.service.findByIdForViewer(id, authUser);
  }

  @Mutation(() => EstateLiquidationRequestEntity)
  startEstateLiquidationRequest(
    @CurrentUser() authUser: AuthTokenPayload,
  ): Promise<EstateLiquidationRequestEntity> {
    return this.service.create(authUser);
  }

  @Mutation(() => EstateLiquidationRequestEntity)
  updateEstateLiquidationRequest(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("input") input: UpdateEstateLiquidationRequestInput,
  ): Promise<EstateLiquidationRequestEntity> {
    return this.service.updateRequestInfo(input, authUser);
  }

  @Mutation(() => EstateLiquidationRequestEntity)
  addEstateLiquidationPiece(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("input") input: CreateEstateLiquidationPieceInput,
  ): Promise<EstateLiquidationRequestEntity> {
    return this.service.addPiece(input, authUser);
  }

  @Mutation(() => EstateLiquidationRequestEntity)
  updateEstateLiquidationPiece(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("input") input: UpdateEstateLiquidationPieceInput,
  ): Promise<EstateLiquidationRequestEntity> {
    return this.service.updatePiece(input, authUser);
  }

  @Mutation(() => EstateLiquidationRequestEntity)
  removeEstateLiquidationPiece(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("pieceId") pieceId: string,
  ): Promise<EstateLiquidationRequestEntity> {
    return this.service.removePiece(pieceId, authUser);
  }

  @Mutation(() => EstateLiquidationRequestEntity)
  simulateEstateLiquidationPayment(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
  ): Promise<EstateLiquidationRequestEntity> {
    return this.service.simulatePayment(id, authUser);
  }

  @Mutation(() => EstateLiquidationRequestEntity)
  cancelEstateLiquidationRequest(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
  ): Promise<EstateLiquidationRequestEntity> {
    return this.service.cancel(id, authUser);
  }

  @Mutation(() => Boolean)
  deleteEstateLiquidationPieceImage(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
  ): Promise<boolean> {
    return this.service.deletePieceImage(id, authUser);
  }

  // --- Panel experto ---

  @Roles(RoleName.MODERATOR, RoleName.ADMIN)
  @Query(() => [ConversationParticipant])
  estateLiquidationExperts(): Promise<ConversationParticipant[]> {
    return this.service.listExperts();
  }

  @Roles(RoleName.MODERATOR, RoleName.ADMIN)
  @Query(() => [EstateLiquidationRequestEntity])
  estateLiquidationRequestsForStaff(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("status", { type: () => EstateLiquidationRequestStatus, nullable: true })
    status?: EstateLiquidationRequestStatus,
    @Args("assignedToMe", { nullable: true }) assignedToMe?: boolean,
  ): Promise<EstateLiquidationRequestEntity[]> {
    return this.service.findForStaff({ status, assignedToMe }, authUser);
  }

  @Roles(RoleName.MODERATOR, RoleName.ADMIN)
  @Mutation(() => EstateLiquidationRequestEntity)
  assignEstateLiquidationExpert(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("requestId") requestId: string,
    @Args("expertId") expertId: string,
  ): Promise<EstateLiquidationRequestEntity> {
    return this.service.assignExpert(requestId, expertId, authUser);
  }

  @Roles(RoleName.MODERATOR, RoleName.ADMIN)
  @Mutation(() => EstateLiquidationRequestEntity)
  setEstateLiquidationRequestStatus(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("requestId") requestId: string,
    @Args("status", { type: () => EstateLiquidationRequestStatus })
    status: EstateLiquidationRequestStatus,
  ): Promise<EstateLiquidationRequestEntity> {
    return this.service.setStatus(requestId, status, authUser);
  }

  @Roles(RoleName.MODERATOR, RoleName.ADMIN)
  @Mutation(() => EstateLiquidationRequestEntity)
  addEstateLiquidationComment(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("requestId") requestId: string,
    @Args("body") body: string,
  ): Promise<EstateLiquidationRequestEntity> {
    return this.service.addComment(requestId, body, authUser);
  }

  @Roles(RoleName.MODERATOR, RoleName.ADMIN)
  @Mutation(() => EstateLiquidationRequestEntity)
  classifyEstateLiquidationPiece(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("input") input: ClassifyPieceInput,
  ): Promise<EstateLiquidationRequestEntity> {
    return this.service.classifyPiece(input, authUser);
  }

  @Roles(RoleName.MODERATOR, RoleName.ADMIN)
  @Mutation(() => EstateLiquidationRequestEntity)
  completeEstateLiquidationReview(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("requestId") requestId: string,
  ): Promise<EstateLiquidationRequestEntity> {
    return this.service.completeReview(requestId, authUser);
  }
}
