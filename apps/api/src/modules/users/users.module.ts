import { Module } from "@nestjs/common";
import { SocialModule } from "@/modules/social/social.module";
import { UsersResolver } from "./users.resolver";
import { UsersService } from "./users.service";

@Module({
  imports: [SocialModule],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
