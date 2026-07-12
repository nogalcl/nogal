import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
  generateOpaqueToken,
  hashOpaqueToken,
} from "@/common/utils/opaque-token";
import type { Env } from "@/config/env.validation";

export interface AccessTokenPayload {
  sub: string;
  role: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  signAccessToken(payload: AccessTokenPayload): {
    token: string;
    expiresInSeconds: number;
  } {
    const expiresIn = this.configService.get("JWT_ACCESS_EXPIRES_IN");
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_ACCESS_SECRET"),
      expiresIn,
    });
    return { token, expiresInSeconds: parseExpiryToSeconds(expiresIn) };
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return this.jwtService.verify<AccessTokenPayload>(token, {
      secret: this.configService.get("JWT_ACCESS_SECRET"),
    });
  }

  /** Token opaco (no JWT): se puede revocar en BD sin depender de su expiración. */
  generateRefreshToken(): {
    token: string;
    tokenHash: string;
    expiresAt: Date;
  } {
    const token = generateOpaqueToken(48);
    const days = this.configService.get("JWT_REFRESH_EXPIRES_IN_DAYS");
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return { token, tokenHash: hashOpaqueToken(token), expiresAt };
  }

  hashRefreshToken(token: string): string {
    return hashOpaqueToken(token);
  }
}

function parseExpiryToSeconds(expiry: string): number {
  const match = /^(\d+)([smhd])$/.exec(expiry);
  if (!match) return 900;
  const value = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };
  return value * multipliers[unit];
}
