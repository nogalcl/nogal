import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import sharp from "sharp";
import type { Env } from "@/config/env.validation";
import type { StorageProvider, StoredImage } from "../storage.interface";

const MAX_DIMENSION = 2400;
const WEBP_QUALITY = 88;

@Injectable()
export class LocalDiskStorageProvider implements StorageProvider {
  private readonly uploadsDir: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly configService: ConfigService<Env, true>) {
    this.uploadsDir = this.configService.get("UPLOADS_DIR");
    this.publicBaseUrl = `${this.configService.get("API_URL")}/uploads`;
  }

  async storeImage({
    buffer,
    keyPrefix,
  }: {
    buffer: Buffer;
    keyPrefix: string;
  }): Promise<StoredImage> {
    let pipeline: sharp.Sharp;
    let metadata: sharp.Metadata;
    try {
      pipeline = sharp(buffer, { failOn: "none" }).rotate();
      metadata = await pipeline.metadata();
    } catch {
      throw new BadRequestException("El archivo no es una imagen válida.");
    }

    if (!metadata.width || !metadata.height) {
      throw new BadRequestException("El archivo no es una imagen válida.");
    }

    const output = await pipeline
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer({ resolveWithObject: true });

    const key = `${keyPrefix}/${randomUUID()}.webp`;
    const destination = join(this.uploadsDir, key);
    await mkdir(join(destination, ".."), { recursive: true });
    await writeFile(destination, output.data);

    return {
      key,
      publicUrl: `${this.publicBaseUrl}/${key}`,
      width: output.info.width,
      height: output.info.height,
    };
  }

  async deleteObject(key: string): Promise<void> {
    await rm(join(this.uploadsDir, key), { force: true });
  }
}
