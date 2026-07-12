import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import {
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { KeyValueInput } from "@/common/graphql/key-value.entity";

@InputType()
export class UpdateStoreInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  bannerUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @Field(() => [KeyValueInput], { nullable: true })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => KeyValueInput)
  socialLinks?: KeyValueInput[];

  @Field(() => [KeyValueInput], { nullable: true })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => KeyValueInput)
  schedule?: KeyValueInput[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  locationCity?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  locationRegion?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  locationCountryId?: string;
}
