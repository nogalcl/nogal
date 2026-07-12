import { Injectable, type ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { ThrottlerGuard } from "@nestjs/throttler";

/** ThrottlerGuard estándar asume contexto HTTP; en GraphQL hay que extraer req/res manualmente. */
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  protected getRequestResponse(context: ExecutionContext) {
    if (context.getType<"graphql" | "http">() !== "graphql") {
      return super.getRequestResponse(context);
    }
    const gqlCtx = GqlExecutionContext.create(context).getContext();
    return { req: gqlCtx.req, res: gqlCtx.res };
  }
}
