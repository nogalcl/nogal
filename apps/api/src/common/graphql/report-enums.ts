import { registerEnumType } from "@nestjs/graphql";
import { ReportStatus, ReportTargetType } from "@nogal/database";

registerEnumType(ReportTargetType, { name: "ReportTargetType" });
registerEnumType(ReportStatus, { name: "ReportStatus" });

export { ReportStatus, ReportTargetType };
