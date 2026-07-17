import { Module } from "@nestjs/common";
import { SocialModule } from "@/modules/social/social.module";
import { ProfileImagesController } from "./profile-images.controller";
import { UsersResolver } from "./users.resolver";
import { UsersService } from "./users.service";

@Module({
  imports: [SocialModule],
  controllers: [ProfileImagesController],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
