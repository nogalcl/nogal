import { registerEnumType } from "@nestjs/graphql";
import {
  EstateLiquidationPieceOutcome,
  EstateLiquidationRequestStatus,
} from "@nogal/database";

registerEnumType(EstateLiquidationRequestStatus, {
  name: "EstateLiquidationRequestStatus",
});
registerEnumType(EstateLiquidationPieceOutcome, {
  name: "EstateLiquidationPieceOutcome",
});

export { EstateLiquidationPieceOutcome, EstateLiquidationRequestStatus };
