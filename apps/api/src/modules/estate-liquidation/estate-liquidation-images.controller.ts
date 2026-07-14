import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Request } from "express";
import type { AuthTokenPayload } from "@/common/guards/jwt-auth.guard";
import { EstateLiquidationService } from "./estate-liquidation.service";

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

// Mismo patrón que ValuationImagesController/FurnitureImagesController: pasa
// por los guards globales (JwtAuthGuard/RolesGuard), solo cambia el
// transporte a REST para el binario. Las imágenes van ancladas a la pieza
// (:pieceId), no a la solicitud completa.
@Controller("estate-liquidation-pieces")
export class EstateLiquidationImagesController {
  constructor(private readonly estateLiquidationService: EstateLiquidationService) {}

  @Post(":pieceId/images")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      fileFilter: (_req, file, callback) => {
        callback(null, ALLOWED_MIME_TYPES.has(file.mimetype));
      },
    }),
  )
  async upload(
    @Param("pieceId") pieceId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body("altText") altText: string | undefined,
    @Req() request: Request & { authUser: AuthTokenPayload },
  ) {
    if (!file) {
      throw new BadRequestException(
        "Formato no soportado. Usa JPEG, PNG, WebP o HEIC.",
      );
    }

    const image = await this.estateLiquidationService.attachPieceImage(
      pieceId,
      { sub: request.authUser.sub, role: request.authUser.role },
      file.buffer,
      altText,
    );

    return {
      id: image.id,
      url: image.url,
      width: image.width,
      height: image.height,
      order: image.order,
      altText: image.altText,
    };
  }
}
