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
import { ValuationService } from "./valuation.service";

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

// Mismo patrón que FurnitureImagesController: pasa por los guards globales
// (JwtAuthGuard/RolesGuard), solo cambia el transporte a REST para el
// binario.
@Controller("valuation-requests")
export class ValuationImagesController {
  constructor(private readonly valuationService: ValuationService) {}

  @Post(":id/images")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      fileFilter: (_req, file, callback) => {
        callback(null, ALLOWED_MIME_TYPES.has(file.mimetype));
      },
    }),
  )
  async upload(
    @Param("id") requestId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body("altText") altText: string | undefined,
    @Req() request: Request & { authUser: AuthTokenPayload },
  ) {
    if (!file) {
      throw new BadRequestException(
        "Formato no soportado. Usa JPEG, PNG, WebP o HEIC.",
      );
    }

    const image = await this.valuationService.attachImage(
      requestId,
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
