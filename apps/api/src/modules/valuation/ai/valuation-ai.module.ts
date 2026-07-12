import { Module } from "@nestjs/common";
import { UnavailableValuationAiProvider } from "./providers/unavailable-valuation-ai.provider";
import { VALUATION_AI_PROVIDER } from "./valuation-ai.interface";

@Module({
  providers: [
    { provide: VALUATION_AI_PROVIDER, useClass: UnavailableValuationAiProvider },
  ],
  exports: [VALUATION_AI_PROVIDER],
})
export class ValuationAiModule {}
