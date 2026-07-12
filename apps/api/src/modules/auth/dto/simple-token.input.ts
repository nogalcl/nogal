import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsString } from "class-validator";

@InputType()
export class VerifyEmailInput {
  @Field()
  @IsString()
  token!: string;
}

@InputType()
export class RequestPasswordResetInput {
  @Field()
  @IsEmail()
  email!: string;
}

@InputType()
export class RefreshInput {
  @Field()
  @IsString()
  refreshToken!: string;
}

@InputType()
export class LogoutInput {
  @Field()
  @IsString()
  refreshToken!: string;
}
