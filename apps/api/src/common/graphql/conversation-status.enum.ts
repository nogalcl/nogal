import { registerEnumType } from "@nestjs/graphql";
import { ConversationStatus } from "@nogal/database";

registerEnumType(ConversationStatus, { name: "ConversationStatus" });

export { ConversationStatus };
