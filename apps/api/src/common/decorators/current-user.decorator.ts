import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { AuthTokenPayload } from "@/common/guards/jwt-auth.guard";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthTokenPayload | null => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return request.authUser ?? null;
  },
);
