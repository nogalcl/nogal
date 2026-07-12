import { Field, InputType } from "@nestjs/graphql";
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @MinLength(10, {
    message: "La contraseña debe tener al menos 10 caracteres.",
  })
  @Matches(/(?=.*[A-Za-z])(?=.*\d)/, {
    message: "La contraseña debe incluir al menos una letra y un número.",
  })
  password!: string;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName!: string;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName!: string;

  @Field()
  @Matches(/^[a-z0-9_.]{3,24}$/, {
    message:
      "El usuario debe tener entre 3 y 24 caracteres: minúsculas, números, puntos o guiones bajos.",
  })
  username!: string;
}
