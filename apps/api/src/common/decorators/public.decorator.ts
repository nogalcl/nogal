import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

/** Marca un resolver como accesible sin token de acceso válido. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
