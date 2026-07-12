import { registerEnumType } from "@nestjs/graphql";
import { TrendCategory } from "@nogal/database";

registerEnumType(TrendCategory, { name: "TrendCategory" });

export { TrendCategory };
