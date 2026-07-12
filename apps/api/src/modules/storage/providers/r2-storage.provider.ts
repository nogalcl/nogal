import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import sharp from "sharp";
import type { Env } from "@/config/env.validation";
import type { StorageProvider, StoredImage } from "../storage.interface";

const MAX_DIMENSION = 2400;
const WEBP_QUALITY = 88;

/**
 * Cloudflare R2 es compatible con la API de S3, así que reutiliza el SDK
 * oficial de AWS apuntando al endpoint de la cuenta R2. Sin cargos de
 * egress, a diferencia de S3 — ver ARCHITECTURE.md, sección 4.3.
 */
@Injectable()
export class R2StorageProvider implements StorageProvider {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly configService: ConfigService<Env, true>) {
    const accountId = this.configService.get("R2_ACCOUNT_ID");
    this.bucket = this.configService.get("R2_BUCKET_NAME")!;
    this.publicBaseUrl = this.configService.get("R2_PUBLIC_URL")!;

    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.configService.get("R2_ACCESS_KEY_ID")!,
        secretAccessKey: this.configService.get("R2_SECRET_ACCESS_KEY")!,
      },
    });
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

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: output.data,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    return {
      key,
      publicUrl: `${this.publicBaseUrl}/${key}`,
      width: output.info.width,
      height: output.info.height,
    };
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
