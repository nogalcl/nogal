import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

@InputType()
export class CreateRestorerInput {
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  specialty?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  email?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
