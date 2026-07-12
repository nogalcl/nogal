import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { RoleName } from "@nogal/database";
import { ROLES_KEY } from "@/common/decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request =
      context.getType<"graphql" | "http">() === "graphql"
        ? GqlExecutionContext.create(context).getContext().req
        : context.switchToHttp().getRequest();
    const role = request.authUser?.role;

    if (!role || !requiredRoles.includes(role)) {
      throw new ForbiddenException(
        "No tienes permisos suficientes para esta acción.",
      );
    }

    return true;
  }
}
