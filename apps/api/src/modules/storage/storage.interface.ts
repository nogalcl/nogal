export interface StoredImage {
  key: string;
  publicUrl: string;
  width: number;
  height: number;
}

export interface StorageProvider {
  /**
   * Procesa (auto-orienta, redimensiona, recomprime a WebP) y guarda una
   * imagen. La entrega en AVIF/WebP responsivo la resuelve next/image en el
   * frontend (ver next.config.ts) — aquí solo se guarda un origen optimizado.
   */
  storeImage(params: {
    buffer: Buffer;
    keyPrefix: string;
  }): Promise<StoredImage>;

  deleteObject(key: string): Promise<void>;
}

export const STORAGE_PROVIDER = "STORAGE_PROVIDER";
