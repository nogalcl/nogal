import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { ValuationRequestStatus } from "@nogal/database";
import { NotificationsService } from "@/modules/notifications/notifications.service";
import {
  STORAGE_PROVIDER,
  type StorageProvider,
} from "@/modules/storage/storage.interface";
import { toParticipant } from "@/modules/messaging/entities/conversation.entity";
import { toValuationRequestEntity } from "./valuation.mapper";
import {
  ValuationRepository,
  type ValuationRequestWithRelations,
} from "./valuation.repository";
import type { UpdateValuationRequestInput } from "./dto/update-valuation-request.input";
import type { ValuationRequestEntity } from "./entities/valuation-request.entity";
import type { ConversationParticipant } from "@/modules/messaging/entities/conversation.entity";

const STAFF_ROLES = new Set(["MODERATOR", "ADMIN"]);

/** DRAFT -> PENDING (pago) -> IN_REVIEW (asignada) -> COMPLETED (informe). CANCELLED desde cualquier estado activo. */
const TRANSITIONS: Record<ValuationRequestStatus, ValuationRequestStatus[]> = {
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
export class ValuationService {
  constructor(
    private readonly repo: ValuationRepository,
    private readonly notifications: NotificationsService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  private isStaff(role: string): boolean {
    return STAFF_ROLES.has(role);
  }

  private async getOwnedOrStaff(
    id: string,
    viewer: Viewer,
  ): Promise<ValuationRequestWithRelations> {
    const request = await this.repo.findById(id);
    if (!request) throw new NotFoundException("Solicitud no encontrada.");
    if (request.requesterId !== viewer.sub && !this.isStaff(viewer.role)) {
      throw new ForbiddenException("No tienes acceso a esta solicitud.");
    }
    return request;
  }

  private async toEntity(
    row: ValuationRequestWithRelations,
    viewer: Viewer,
  ): Promise<ValuationRequestEntity> {
    const forStaff = this.isStaff(viewer.role);
    const history = forStaff ? await this.repo.findHistory(row.id) : undefined;
    return toValuationRequestEntity(row, { forStaff, history });
  }

  // ---------------------------------------------------------------------
  // Solicitante
  // ---------------------------------------------------------------------

  async create(viewer: Viewer): Promise<ValuationRequestEntity> {
    const created = await this.repo.create(viewer.sub);
    return this.toEntity(created, viewer);
  }

  async findMine(viewer: Viewer): Promise<ValuationRequestEntity[]> {
    const rows = await this.repo.findManyByRequester(viewer.sub);
    return Promise.all(rows.map((row) => this.toEntity(row, viewer)));
  }

  async findByIdForViewer(
    id: string,
    viewer: Viewer,
  ): Promise<ValuationRequestEntity> {
    const request = await this.getOwnedOrStaff(id, viewer);
    return this.toEntity(request, viewer);
  }

  async updateInfo(
    input: UpdateValuationRequestInput,
    viewer: Viewer,
  ): Promise<ValuationRequestEntity> {
    const request = await this.getOwnedOrStaff(input.id, viewer);
    if (request.status !== "DRAFT") {
      throw new BadRequestException(
        "Solo se puede editar la información mientras la solicitud es un borrador.",
      );
    }

    const updated = await this.repo.update(input.id, {
      title: input.title,
      description: input.description,
      category: input.categoryId
        ? { connect: { id: input.categoryId } }
        : undefined,
      estimatedDecade: input.estimatedDecade,
      locationCity: input.locationCity,
      objective: input.objective,
    });
    return this.toEntity(updated, viewer);
  }

  async attachImage(
    requestId: string,
    viewer: Viewer,
    buffer: Buffer,
    altText?: string,
  ) {
    const request = await this.getOwnedOrStaff(requestId, viewer);
    if (request.status !== "DRAFT") {
      throw new BadRequestException(
        "Solo se pueden agregar fotografías mientras la solicitud es un borrador.",
      );
    }
    if (request.images.length >= 12) {
      throw new BadRequestException("Máximo 12 fotografías por solicitud.");
    }

    const stored = await this.storage.storeImage({
      buffer,
      keyPrefix: `valuation/${requestId}`,
    });

    const order = await this.repo.nextImageOrder(requestId);
    return this.repo.createImage({
      valuationRequest: { connect: { id: requestId } },
      url: stored.publicUrl,
      altText: altText?.trim() || null,
      order,
      width: stored.width,
      height: stored.height,
    });
  }

  async deleteImage(imageId: string, viewer: Viewer): Promise<boolean> {
    const image = await this.repo.findImageById(imageId);
    if (!image) throw new NotFoundException("Imagen no encontrada.");
    await this.getOwnedOrStaff(image.valuationRequestId, viewer);

    await this.storage.deleteObject(keyFromPublicUrl(image.url));
    await this.repo.deleteImage(imageId);
    return true;
  }

  /** Paso 5 del wizard — pago simulado, sin pasarela real. */
  async simulatePayment(
    id: string,
    viewer: Viewer,
  ): Promise<ValuationRequestEntity> {
    const request = await this.getOwnedOrStaff(id, viewer);
    if (request.status !== "DRAFT") {
      throw new BadRequestException("Esta solicitud ya fue enviada.");
    }
    if (!request.title || !request.description || !request.objective) {
      throw new BadRequestException(
        "Completa la información y el objetivo antes de continuar.",
      );
    }
    if (request.images.length === 0) {
      throw new BadRequestException("Agrega al menos una fotografía.");
    }

    const updated = await this.repo.update(id, {
      status: "PENDING",
      paidAt: new Date(),
    });
    await this.repo.logHistory(viewer.sub, id, "valuation.submitted");
    await this.notifyStaffOfNewRequest(updated);
    return this.toEntity(updated, viewer);
  }

  /** "Administrador recibe solicitud" del flujo — sin tipo de notificación
   * dedicado (evita otra migración de enum): reutiliza SYSTEM con un
   * mensaje ya formateado. */
  private async notifyStaffOfNewRequest(
    request: ValuationRequestWithRelations,
  ): Promise<void> {
    const staffIds = await this.repo.findStaffUserIds();
    const title = request.title ?? "una pieza";
    await Promise.all(
      staffIds.map((staffId) =>
        this.notifications.create(staffId, "SYSTEM", {
          message: `Nueva solicitud de valoración: "${title}".`,
          link: `/valoracion-express/panel/${request.id}`,
        }),
      ),
    );
  }

  async cancel(id: string, viewer: Viewer): Promise<ValuationRequestEntity> {
    const request = await this.getOwnedOrStaff(id, viewer);
    this.assertTransition(request.status, "CANCELLED");

    const updated = await this.repo.update(id, { status: "CANCELLED" });
    await this.repo.logHistory(viewer.sub, id, "valuation.cancelled");
    return this.toEntity(updated, viewer);
  }

  // ---------------------------------------------------------------------
  // Panel experto (MODERATOR/ADMIN — @Roles aplicado en el resolver)
  // ---------------------------------------------------------------------

  async listExperts(): Promise<ConversationParticipant[]> {
    const rows = await this.repo.findStaffUsers();
    return rows.map((row) => toParticipant(row));
  }

  async findForStaff(filter: {
    status?: ValuationRequestStatus;
    assignedToMe?: boolean;
  }, viewer: Viewer): Promise<ValuationRequestEntity[]> {
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
  ): Promise<ValuationRequestEntity> {
    const request = await this.repo.findById(requestId);
    if (!request) throw new NotFoundException("Solicitud no encontrada.");

    const data: Parameters<ValuationRepository["update"]>[1] = {
      assignedExpert: { connect: { id: expertId } },
    };
    if (request.status === "PENDING") data.status = "IN_REVIEW";

    const updated = await this.repo.update(requestId, data);
    const expertName = updated.assignedExpert?.profile
      ? `${updated.assignedExpert.profile.firstName} ${updated.assignedExpert.profile.lastName}`
      : "un especialista";
    await this.repo.logHistory(viewer.sub, requestId, "valuation.assigned", {
      expertName,
    });
    return this.toEntity(updated, viewer);
  }

  async setStatus(
    requestId: string,
    status: ValuationRequestStatus,
    viewer: Viewer,
  ): Promise<ValuationRequestEntity> {
    const request = await this.repo.findById(requestId);
    if (!request) throw new NotFoundException("Solicitud no encontrada.");
    this.assertTransition(request.status, status);

    const updated = await this.repo.update(requestId, { status });
    await this.repo.logHistory(viewer.sub, requestId, "valuation.status_changed", {
      to: status,
    });
    return this.toEntity(updated, viewer);
  }

  async addComment(
    requestId: string,
    body: string,
    viewer: Viewer,
  ): Promise<ValuationRequestEntity> {
    const request = await this.repo.findById(requestId);
    if (!request) throw new NotFoundException("Solicitud no encontrada.");

    await this.repo.addComment(requestId, viewer.sub, body);
    const updated = await this.repo.findById(requestId);
    return this.toEntity(updated!, viewer);
  }

  private assertTransition(
    from: ValuationRequestStatus,
    to: ValuationRequestStatus,
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
