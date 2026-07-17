import {
  BadRequestException,
  Controller,
  Delete,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Request } from "express";
import type { AuthTokenPayload } from "@/common/guards/jwt-auth.guard";
import { UsersService } from "./users.service";

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

// Mismo patrón que ValuationImagesController: pasa por los guards globales
// (JwtAuthGuard/RolesGuard), solo cambia el transporte a REST para el
// binario. Foto de perfil propia únicamente — no hay concepto de "staff"
// acá, cada usuario solo puede tocar su propio avatar (via authUser.sub).
@Controller("profile")
export class ProfileImagesController {
  constructor(private readonly usersService: UsersService) {}

  @Post("avatar")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      fileFilter: (_req, file, callback) => {
        callback(null, ALLOWED_MIME_TYPES.has(file.mimetype));
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() request: Request & { authUser: AuthTokenPayload },
  ) {
    if (!file) {
      throw new BadRequestException(
        "Formato no soportado. Usa JPEG, PNG, WebP o HEIC.",
      );
    }
    const user = await this.usersService.updateAvatar(
      request.authUser.sub,
      file.buffer,
    );
    return { avatarUrl: user.profile?.avatarUrl ?? null };
  }

  @Delete("avatar")
  async remove(@Req() request: Request & { authUser: AuthTokenPayload }) {
    await this.usersService.removeAvatar(request.authUser.sub);
    return { avatarUrl: null };
  }
}
