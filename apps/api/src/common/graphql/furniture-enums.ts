import { registerEnumType } from "@nestjs/graphql";
import {
  FurnitureCondition,
  FurnitureStatus,
  FurnitureValuationStatus,
  FurnitureVerificationStatus,
  Originality,
  PriceType,
  ShippingMethod,
} from "@nogal/database";

registerEnumType(FurnitureStatus, { name: "FurnitureStatus" });
registerEnumType(FurnitureCondition, { name: "FurnitureCondition" });
registerEnumType(PriceType, { name: "PriceType" });
registerEnumType(Originality, { name: "Originality" });
registerEnumType(ShippingMethod, { name: "ShippingMethod" });
registerEnumType(FurnitureVerificationStatus, {
  name: "FurnitureVerificationStatus",
});
registerEnumType(FurnitureValuationStatus, {
  name: "FurnitureValuationStatus",
});

/** Ordenamiento del explorador. */
export enum FurnitureSort {
  RECENT = "RECENT",
  OLDEST = "OLDEST",
  PRICE_ASC = "PRICE_ASC",
  PRICE_DESC = "PRICE_DESC",
  MOST_VIEWED = "MOST_VIEWED",
  MOST_SAVED = "MOST_SAVED",
}
registerEnumType(FurnitureSort, { name: "FurnitureSort" });

export {
  FurnitureCondition,
  FurnitureStatus,
  FurnitureValuationStatus,
  FurnitureVerificationStatus,
  Originality,
  PriceType,
  ShippingMethod,
};
