import { Field, InputType } from "@nestjs/graphql";
import { IsString, IsUUID, MaxLength, MinLength } from "class-validator";

@InputType()
export class RejectFurnitureInput {
  @Field()
  @IsUUID()
  id!: string;

  @Field()
  @IsString()
  @MinLength(10, { message: "Explica brevemente el motivo del rechazo." })
  @MaxLength(1000)
  reason!: string;
}
