import { registerEnumType } from "@nestjs/graphql";
import { ValuationObjective, ValuationRequestStatus } from "@nogal/database";

registerEnumType(ValuationRequestStatus, { name: "ValuationRequestStatus" });
registerEnumType(ValuationObjective, { name: "ValuationObjective" });

export { ValuationObjective, ValuationRequestStatus };
