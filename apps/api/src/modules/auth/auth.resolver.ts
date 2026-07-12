import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { Throttle } from "@nestjs/throttler";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Public } from "@/common/decorators/public.decorator";
import type { AuthTokenPayload } from "@/common/guards/jwt-auth.guard";
import { AuthService } from "./auth.service";
import { LoginInput } from "./dto/login.input";
import { RegisterInput } from "./dto/register.input";
import { ResetPasswordInput } from "./dto/reset-password.input";
import {
  LogoutInput,
  RefreshInput,
  RequestPasswordResetInput,
  VerifyEmailInput,
} from "./dto/simple-token.input";
import { AuthPayload } from "./entities/auth-payload.entity";

const AUTH_THROTTLE = { default: { limit: 5, ttl: 60_000 } };

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Mutation(() => AuthPayload)
  async register(@Args("input") input: RegisterInput): Promise<AuthPayload> {
    return this.authService.register(input);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Mutation(() => AuthPayload)
  async login(@Args("input") input: LoginInput): Promise<AuthPayload> {
    return this.authService.login(input);
  }

  @Public()
  @Mutation(() => AuthPayload)
  async refreshSession(
    @Args("input") input: RefreshInput,
  ): Promise<AuthPayload> {
    return this.authService.refresh(input.refreshToken);
  }

  @Public()
  @Mutation(() => Boolean)
  async logout(@Args("input") input: LogoutInput): Promise<boolean> {
    return this.authService.logout(input.refreshToken);
  }

  @Public()
  @Mutation(() => Boolean)
  async verifyEmail(@Args("input") input: VerifyEmailInput): Promise<boolean> {
    return this.authService.verifyEmail(input.token);
  }

  @Mutation(() => Boolean)
  async resendVerificationEmail(
    @CurrentUser() authUser: AuthTokenPayload,
  ): Promise<boolean> {
    return this.authService.resendVerificationEmail(authUser.sub);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Mutation(() => Boolean)
  async requestPasswordReset(
    @Args("input") input: RequestPasswordResetInput,
  ): Promise<boolean> {
    return this.authService.requestPasswordReset(input.email);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Mutation(() => Boolean)
  async resetPassword(
    @Args("input") input: ResetPasswordInput,
  ): Promise<boolean> {
    return this.authService.resetPassword(input.token, input.newPassword);
  }
}
