import slugifyLib from "slugify";

export function slugify(value: string): string {
  return slugifyLib(value, { lower: true, strict: true, trim: true });
}

/**
 * Genera un slug único añadiendo un sufijo numérico si hace falta
 * (p. ej. "silla-wegner", "silla-wegner-2"...).
 */
export async function generateUniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base) || "pieza";
  let candidate = root;
  let attempt = 1;

  while (await exists(candidate)) {
    attempt += 1;
    candidate = `${root}-${attempt}`;
  }

  return candidate;
}
