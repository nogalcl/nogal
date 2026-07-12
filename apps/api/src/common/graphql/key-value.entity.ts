import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString, MaxLength } from "class-validator";

/**
 * Representa un mapa flexible (p. ej. redes sociales, horario) como lista
 * de pares en vez de un scalar JSON opaco — mantiene el schema GraphQL
 * completamente tipado sin añadir una dependencia de scalar externa.
 */
@ObjectType()
export class KeyValueEntity {
  @Field()
  key!: string;

  @Field()
  value!: string;
}

@InputType()
export class KeyValueInput {
  @Field()
  @IsString()
  @MaxLength(60)
  key!: string;

  @Field()
  @IsString()
  @MaxLength(300)
  value!: string;
}

export function jsonToKeyValueList(
  value: unknown,
): KeyValueEntity[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value as Record<string, unknown>)
    .filter((entry): entry is [string, string] => typeof entry[1] === "string")
    .map(([key, val]) => ({ key, value: val }));
}

export function keyValueListToJson(
  list: KeyValueInput[] | undefined,
): Record<string, string> | undefined {
  if (!list) return undefined;
  return Object.fromEntries(list.map(({ key, value }) => [key, value]));
}
