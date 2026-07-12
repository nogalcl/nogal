import { Field, InputType, PartialType } from "@nestjs/graphql";
import { IsUUID } from "class-validator";
import { CreateFurnitureInput } from "./create-furniture.input";

@InputType()
export class UpdateFurnitureInput extends PartialType(CreateFurnitureInput) {
  @Field()
  @IsUUID()
  id!: string;
}
