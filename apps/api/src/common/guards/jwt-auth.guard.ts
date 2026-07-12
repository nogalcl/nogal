import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { IS_PUBLIC_KEY } from "@/common/decorators/public.decorator";
import { TokenService } from "@/modules/auth/token.service";

export interface AuthTokenPayload {
  sub: string;
  role: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request =
      context.getType<"graphql" | "http">() === "graphql"
        ? GqlExecutionContext.create(context).getContext().req
        : context.switchToHttp().getRequest();
    const token = extractBearerToken(request.headers?.authorization);

    if (token) {
      try {
        request.authUser = this.tokenService.verifyAccessToken(token);
      } catch {
        request.authUser = null;
      }
    }

    if (isPublic) return true;

    if (!request.authUser) {
      throw new UnauthorizedException("Sesión inválida o expirada.");
    }

    return true;
  }
}

function extractBearerToken(header?: string): string | null {
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}
