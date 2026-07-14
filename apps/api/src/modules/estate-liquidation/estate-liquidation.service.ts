import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { EstateLiquidationRequestStatus } from "@nogal/database";
import { NotificationsService } from "@/modules/notifications/notifications.service";
import {
  STORAGE_PROVIDER,
  type StorageProvider,
} from "@/modules/storage/storage.interface";
import { toParticipant } from "@/modules/messaging/entities/conversation.entity";
import { toEstateLiquidationRequestEntity } from "./estate-liquidation.mapper";
import {
  EstateLiquidationRepository,
  type EstateLiquidationRequestWithRelations,
} from "./estate-liquidation.repository";
import type { UpdateEstateLiquidationRequestInput } from "./dto/update-estate-liquidation-request.input";
import type {
  CreateEstateLiquidationPieceInput,
  UpdateEstateLiquidationPieceInput,
} from "./dto/estate-liquidation-piece.input";
import type { ClassifyPieceInput } from "./dto/classify-piece.input";
import type { EstateLiquidationRequestEntity } from "./entities/estate-liquidation-request.entity";
import type { ConversationParticipant } from "@/modules/messaging/entities/conversation.entity";

const STAFF_ROLES = new Set(["MODERATOR", "ADMIN"]);
const MAX_IMAGES_PER_PIECE = 8;

/** DRAFT -> PENDING (pago) -> IN_REVIEW (asignada) -> COMPLETED (todas las
 * piezas clasificadas). CANCELLED desde cualquier estado activo. */
const TRANSITIONS: Record<
  EstateLiquidationRequestStatus,
  EstateLiquidationRequestStatus[]
> = {
  DRAFT: ["PENDING", "CANCELLED"],
  PENDING: ["IN_REVIEW", "CANCELLED"],
  IN_REVIEW: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export interface Viewer {
  sub: string;
  role: string;
}

@Injectable()
export class EstateLiquidationService {
  constructor(
    private readonly repo: EstateLiquidationRepository,
    private readonly notifications: NotificationsService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  private isStaff(role: string): boolean {
    return STAFF_ROLES.has(role);
  }

  private async getOwnedOrStaff(
    id: string,
    viewer: Viewer,
  ): Promise<EstateLiquidationRequestWithRelations> {
    const request = await this.repo.findById(id);
    if (!request) throw new NotFoundException("Solicitud no encontrada.");
    if (request.requesterId !== viewer.sub && !this.isStaff(viewer.role)) {
      throw new ForbiddenException("No tienes acceso a esta solicitud.");
    }
    return request;
  }

  private async toEntity(
    row: EstateLiquidationRequestWithRelations,
    viewer: Viewer,
  ): Promise<EstateLiquidationRequestEntity> {
    const forStaff = this.isStaff(viewer.role);
    const history = forStaff ? await this.repo.findHistory(row.id) : undefined;
    return toEstateLiquidationRequestEntity(row, { forStaff, history });
  }

  // ---------------------------------------------------------------------
  // Solicitante
  // ---------------------------------------------------------------------

  async create(viewer: Viewer): Promise<EstateLiquidationRequestEntity> {
    const created = await this.repo.create(viewer.sub);
    return this.toEntity(created, viewer);
  }

  async findMine(viewer: Viewer): Promise<EstateLiquidationRequestEntity[]> {
    const rows = await this.repo.findManyByRequester(viewer.sub);
    return Promise.all(rows.map((row) => this.toEntity(row, viewer)));
  }

  async findByIdForViewer(
    id: string,
    viewer: Viewer,
  ): Promise<EstateLiquidationRequestEntity> {
    const request = await this.getOwnedOrStaff(id, viewer);
    return this.toEntity(request, viewer);
  }

  async updateRequestInfo(
    input: UpdateEstateLiquidationRequestInput,
    viewer: Viewer,
  ): Promise<EstateLiquidationRequestEntity> {
    const request = await this.getOwnedOrStaff(input.id, viewer);
    if (request.status !== "DRAFT") {
      throw new BadRequestException(
        "Solo se puede editar la información mientras la solicitud es un borrador.",
      );
    }

    const updated = await this.repo.update(input.id, {
      contactName: input.contactName,
      contactPhone: input.contactPhone,
      addressLine: input.addressLine,
      addressCity: input.addressCity,
      addressRegion: input.addressRegion,
      visitNotes: input.visitNotes,
    });
    return this.toEntity(updated, viewer);
  }

  // --- Piezas (solo mientras la solicitud es DRAFT) ---

  async addPiece(
    input: CreateEstateLiquidationPieceInput,
    viewer: Viewer,
  ): Promise<EstateLiquidationRequestEntity> {
    const request = await this.getOwnedOrStaff(input.requestId, viewer);
    if (request.status !== "DRAFT") {
      throw new BadRequestException(
        "Solo se pueden agregar piezas mientras la solicitud es un borrador.",
      );
    }

    const order = await this.repo.nextPieceOrder(input.requestId);
    await this.repo.createPiece({
      requestId: input.requestId,
      title: input.title,
      description: input.description,
      categoryId: input.categoryId,
      order,
    });

    const updated = await this.repo.findById(input.requestId);
    return this.toEntity(updated!, viewer);
  }

  private async getOwnedPieceOrStaff(pieceId: string, viewer: Viewer) {
    const piece = await this.repo.findPieceById(pieceId);
    if (!piece) throw new NotFoundException("Pieza no encontrada.");
    if (piece.request.requesterId !== viewer.sub && !this.isStaff(viewer.role)) {
      throw new ForbiddenException("No tienes acceso a esta pieza.");
    }
    return piece;
  }

  async updatePiece(
    input: UpdateEstateLiquidationPieceInput,
    viewer: Viewer,
  ): Promise<EstateLiquidationRequestEntity> {
    const piece = await this.getOwnedPieceOrStaff(input.id, viewer);
    if (piece.request.status !== "DRAFT") {
      throw new BadRequestException(
        "Solo se pueden editar piezas mientras la solicitud es un borrador.",
      );
    }

    await this.repo.updatePiece(input.id, {
      title: input.title,
      description: input.description,
      category:
        input.categoryId !== undefined
          ? input.categoryId
            ? { connect: { id: input.categoryId } }
            : { disconnect: true }
          : undefined,
    });

    const updated = await this.repo.findById(piece.requestId);
    return this.toEntity(updated!, viewer);
  }

  async removePiece(
    pieceId: string,
    viewer: Viewer,
  ): Promise<EstateLiquidationRequestEntity> {
    const piece = await this.getOwnedPieceOrStaff(pieceId, viewer);
    if (piece.request.status !== "DRAFT") {
      throw new BadRequestException(
        "Solo se pueden quitar piezas mientras la solicitud es un borrador.",
      );
    }

    const images = piece.images;
    await this.repo.deletePiece(pieceId);
    await Promise.all(
      images.map((image) => this.storage.deleteObject(keyFromPublicUrl(image.url))),
    );

    const updated = await this.repo.findById(piece.requestId);
    return this.toEntity(updated!, viewer);
  }

  async attachPieceImage(
    pieceId: string,
    viewer: Viewer,
    buffer: Buffer,
    altText?: string,
  ) {
    const piece = await this.getOwnedPieceOrStaff(pieceId, viewer);
    if (piece.request.status !== "DRAFT") {
      throw new BadRequestException(
        "Solo se pueden agregar fotografías mientras la solicitud es un borrador.",
      );
    }
    if (piece.images.length >= MAX_IMAGES_PER_PIECE) {
      throw new BadRequestException(
        `Máximo ${MAX_IMAGES_PER_PIECE} fotografías por pieza.`,
      );
    }

    const stored = await this.storage.storeImage({
      buffer,
      keyPrefix: `estate-liquidation/${pieceId}`,
    });

    const order = await this.repo.nextImageOrder(pieceId);
    return this.repo.createImage({
      piece: { connect: { id: pieceId } },
      url: stored.publicUrl,
      altText: altText?.trim() || null,
      order,
      width: stored.width,
      height: stored.height,
    });
  }

  async deletePieceImage(imageId: string, viewer: Viewer): Promise<boolean> {
    const image = await this.repo.findImageById(imageId);
    if (!image) throw new NotFoundException("Imagen no encontrada.");
    await this.getOwnedPieceOrStaff(image.pieceId, viewer);

    await this.storage.deleteObject(keyFromPublicUrl(image.url));
    await this.repo.deleteImage(imageId);
    return true;
  }

  /** Último paso del wizard — pago simulado, sin pasarela real. Congela
   * totalFee = unitFee × cantidad de piezas en ese momento. */
  async simulatePayment(
    id: string,
    viewer: Viewer,
  ): Promise<EstateLiquidationRequestEntity> {
    const request = await this.getOwnedOrStaff(id, viewer);
    if (request.status !== "DRAFT") {
      throw new BadRequestException("Esta solicitud ya fue enviada.");
    }
    if (!request.contactName || !request.contactPhone || !request.addressLine) {
      throw new BadRequestException(
        "Completa el contacto y la dirección antes de continuar.",
      );
    }
    if (request.pieces.length === 0) {
      throw new BadRequestException("Agrega al menos una pieza.");
    }
    const pieceWithoutImages = request.pieces.find(
      (piece) => piece.images.length === 0,
    );
    if (pieceWithoutImages) {
      throw new BadRequestException(
        `Agrega al menos una fotografía a "${pieceWithoutImages.title}".`,
      );
    }

    const totalFee = Number(request.unitFee) * request.pieces.length;
    const updated = await this.repo.update(id, {
      status: "PENDING",
      paidAt: new Date(),
      totalFee,
    });
    await this.repo.logHistory(viewer.sub, id, "estate_liquidation.submitted");
    await this.notifyStaffOfNewRequest(updated);
    return this.toEntity(updated, viewer);
  }

  /** "Administrador recibe solicitud" del flujo — sin tipo de notificación
   * dedicado (evita otra migración de enum): reutiliza SYSTEM con un
   * mensaje ya formateado, igual criterio que Valoración Express. */
  private async notifyStaffOfNewRequest(
    request: EstateLiquidationRequestWithRelations,
  ): Promise<void> {
    const staffIds = await this.repo.findStaffUserIds();
    const contactName = request.contactName ?? "un cliente";
    await Promise.all(
      staffIds.map((staffId) =>
        this.notifications.create(staffId, "SYSTEM", {
          message: `Nueva solicitud de liquidación de patrimonio de ${contactName} (${request.pieces.length} piezas).`,
          link: `/liquidacion-patrimonio/panel/${request.id}`,
        }),
      ),
    );
  }

  async cancel(
    id: string,
    viewer: Viewer,
  ): Promise<EstateLiquidationRequestEntity> {
    const request = await this.getOwnedOrStaff(id, viewer);
    this.assertTransition(request.status, "CANCELLED");

    const updated = await this.repo.update(id, { status: "CANCELLED" });
    await this.repo.logHistory(viewer.sub, id, "estate_liquidation.cancelled");
    return this.toEntity(updated, viewer);
  }

  // ---------------------------------------------------------------------
  // Panel experto (MODERATOR/ADMIN — @Roles aplicado en el resolver)
  // ---------------------------------------------------------------------

  async listExperts(): Promise<ConversationParticipant[]> {
    const rows = await this.repo.findStaffUsers();
    return rows.map((row) => toParticipant(row));
  }

  async findForStaff(
    filter: { status?: EstateLiquidationRequestStatus; assignedToMe?: boolean },
    viewer: Viewer,
  ): Promise<EstateLiquidationRequestEntity[]> {
    const rows = await this.repo.findManyForStaff({
      status: filter.status,
      assignedExpertId: filter.assignedToMe ? viewer.sub : undefined,
    });
    return Promise.all(rows.map((row) => this.toEntity(row, viewer)));
  }

  async assignExpert(
    requestId: string,
    expertId: string,
    viewer: Viewer,
  ): Promise<EstateLiquidationRequestEntity> {
    const request = await this.repo.findById(requestId);
    if (!request) throw new NotFoundException("Solicitud no encontrada.");

    const data: Parameters<EstateLiquidationRepository["update"]>[1] = {
      assignedExpert: { connect: { id: expertId } },
    };
    if (request.status === "PENDING") data.status = "IN_REVIEW";

    const updated = await this.repo.update(requestId, data);
    const expertName = updated.assignedExpert?.profile
      ? `${updated.assignedExpert.profile.firstName} ${updated.assignedExpert.profile.lastName}`
      : "un especialista";
    await this.repo.logHistory(
      viewer.sub,
      requestId,
      "estate_liquidation.assigned",
      { expertName },
    );
    return this.toEntity(updated, viewer);
  }

  async setStatus(
    requestId: string,
    status: EstateLiquidationRequestStatus,
    viewer: Viewer,
  ): Promise<EstateLiquidationRequestEntity> {
    const request = await this.repo.findById(requestId);
    if (!request) throw new NotFoundException("Solicitud no encontrada.");
    this.assertTransition(request.status, status);

    const updated = await this.repo.update(requestId, { status });
    await this.repo.logHistory(
      viewer.sub,
      requestId,
      "estate_liquidation.status_changed",
      { to: status },
    );
    return this.toEntity(updated, viewer);
  }

  async addComment(
    requestId: string,
    body: string,
    viewer: Viewer,
  ): Promise<EstateLiquidationRequestEntity> {
    const request = await this.repo.findById(requestId);
    if (!request) throw new NotFoundException("Solicitud no encontrada.");

    await this.repo.addComment(requestId, viewer.sub, body);
    const updated = await this.repo.findById(requestId);
    return this.toEntity(updated!, viewer);
  }

  /** Clasifica una pieza con su resultado — requiere que la solicitud esté
   * en revisión. El restaurador es obligatorio solo cuando el resultado es
   * "derivar a restaurador", y se rechaza en cualquier otro caso (evita
   * dejar una referencia colgante a un restaurador que no aplica). */
  async classifyPiece(
    input: ClassifyPieceInput,
    viewer: Viewer,
  ): Promise<EstateLiquidationRequestEntity> {
    const piece = await this.repo.findPieceById(input.pieceId);
    if (!piece) throw new NotFoundException("Pieza no encontrada.");
    if (piece.request.status !== "IN_REVIEW") {
      throw new BadRequestException(
        "La solicitud debe estar en revisión para clasificar piezas.",
      );
    }
    if (input.outcome === "REFER_RESTORER" && !input.recommendedRestorerId) {
      throw new BadRequestException(
        "Selecciona un restaurador para derivar esta pieza.",
      );
    }
    if (input.outcome !== "REFER_RESTORER" && input.recommendedRestorerId) {
      throw new BadRequestException(
        "Solo puedes indicar un restaurador cuando el resultado es derivar a restauración.",
      );
    }
    if (
      input.estimatedValueMin != null &&
      input.estimatedValueMax != null &&
      input.estimatedValueMin > input.estimatedValueMax
    ) {
      throw new BadRequestException(
        "El valor mínimo no puede ser mayor que el máximo.",
      );
    }

    await this.repo.updatePiece(input.pieceId, {
      outcome: input.outcome,
      condition: input.condition,
      expertNotes: input.expertNotes,
      estimatedValueMin: input.estimatedValueMin,
      estimatedValueMax: input.estimatedValueMax,
      recommendedRestorer: input.recommendedRestorerId
        ? { connect: { id: input.recommendedRestorerId } }
        : { disconnect: true },
      classifiedAt: new Date(),
      classifiedBy: { connect: { id: viewer.sub } },
    });

    await this.repo.logHistory(
      viewer.sub,
      piece.requestId,
      "estate_liquidation.piece_classified",
      { pieceTitle: piece.title },
    );

    const updated = await this.repo.findById(piece.requestId);
    return this.toEntity(updated!, viewer);
  }

  /** Checkpoint explícito de staff — no se auto-completa al clasificar la
   * última pieza, para no sorprender si se agrega/edita una pieza después
   * de que las demás ya tenían resultado. */
  async completeReview(
    requestId: string,
    viewer: Viewer,
  ): Promise<EstateLiquidationRequestEntity> {
    const request = await this.repo.findById(requestId);
    if (!request) throw new NotFoundException("Solicitud no encontrada.");
    this.assertTransition(request.status, "COMPLETED");

    const missing = request.pieces.some((piece) => !piece.outcome);
    if (missing) {
      throw new BadRequestException(
        "Todas las piezas deben tener un resultado antes de completar la revisión.",
      );
    }

    const updated = await this.repo.update(requestId, { status: "COMPLETED" });
    await this.repo.logHistory(
      viewer.sub,
      requestId,
      "estate_liquidation.completed",
    );
    await this.notifications.create(
      request.requesterId,
      "ESTATE_LIQUIDATION_READY",
      {
        requestId: request.id,
        contactName: request.contactName,
      },
    );
    return this.toEntity(updated, viewer);
  }

  private assertTransition(
    from: EstateLiquidationRequestStatus,
    to: EstateLiquidationRequestStatus,
  ): void {
    if (!TRANSITIONS[from].includes(to)) {
      throw new BadRequestException(`No se puede pasar de "${from}" a "${to}".`);
    }
  }
}

function keyFromPublicUrl(url: string): string {
  const marker = "/uploads/";
  const index = url.indexOf(marker);
  return index === -1 ? url : url.slice(index + marker.length);
}
