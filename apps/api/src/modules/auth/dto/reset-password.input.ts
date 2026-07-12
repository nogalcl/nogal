import { Field, InputType } from "@nestjs/graphql";
import { IsString, Matches, MinLength } from "class-validator";

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsString()
  token!: string;

  @Field()
  @MinLength(10, {
    message: "La contraseña debe tener al menos 10 caracteres.",
  })
  @Matches(/(?=.*[A-Za-z])(?=.*\d)/, {
    message: "La contraseña debe incluir al menos una letra y un número.",
  })
  newPassword!: string;
}
