import { registerEnumType } from "@nestjs/graphql";
import { NotificationType } from "@nogal/database";

registerEnumType(NotificationType, { name: "NotificationType" });

export { NotificationType };
