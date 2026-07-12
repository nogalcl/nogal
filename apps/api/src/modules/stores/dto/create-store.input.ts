import { Field, InputType } from "@nestjs/graphql";
import { IsString, MaxLength, MinLength } from "class-validator";

@InputType()
export class CreateStoreInput {
  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;
}
