import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "@/modules/users/users.module";
import { AuthResolver } from "./auth.resolver";
import { AuthService } from "./auth.service";
import { TokenService } from "./token.service";

@Module({
  imports: [JwtModule.register({}), UsersModule],
  providers: [AuthService, AuthResolver, TokenService],
  exports: [TokenService],
})
export class AuthModule {}
