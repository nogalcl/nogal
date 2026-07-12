import { registerEnumType } from "@nestjs/graphql";
import { RoleName } from "@nogal/database";

registerEnumType(RoleName, { name: "RoleName" });

export { RoleName };
