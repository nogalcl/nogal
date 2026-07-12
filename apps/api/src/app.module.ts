import { join } from "node:path";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { ThrottlerModule } from "@nestjs/throttler";
import { GqlThrottlerGuard } from "@/common/guards/gql-throttler.guard";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { validateEnv } from "@/config/env.validation";
import { AuthModule } from "@/modules/auth/auth.module";
import { FurnitureModule } from "@/modules/furniture/furniture.module";
import { MailModule } from "@/modules/mail/mail.module";
import { PrismaModule } from "@/modules/prisma/prisma.module";
import { StorageModule } from "@/modules/storage/storage.module";
import { StoresModule } from "@/modules/stores/stores.module";
import { TaxonomyModule } from "@/modules/taxonomy/taxonomy.module";
import { UsersModule } from "@/modules/users/users.module";
import { NotificationsModule } from "@/modules/notifications/notifications.module";
import { SocialModule } from "@/modules/social/social.module";
import { FavoritesModule } from "@/modules/favorites/favorites.module";
import { CollectionsModule } from "@/modules/collections/collections.module";
import { MessagingModule } from "@/modules/messaging/messaging.module";
import { ReportsModule } from "@/modules/reports/reports.module";
import { ValuationModule } from "@/modules/valuation/valuation.module";
import { AuditModule } from "@/modules/audit/audit.module";
import { TrendsModule } from "@/modules/trends/trends.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 120 }],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      sortSchema: true,
      playground: process.env.NODE_ENV !== "production",
      context: ({ req, res }: { req: unknown; res: unknown }) => ({
        req,
        res,
      }),
    }),
    PrismaModule,
    StorageModule,
    MailModule,
    UsersModule,
    AuthModule,
    StoresModule,
    TaxonomyModule,
    FurnitureModule,
    NotificationsModule,
    SocialModule,
    FavoritesModule,
    CollectionsModule,
    MessagingModule,
    ReportsModule,
    ValuationModule,
    AuditModule,
    TrendsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: GqlThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
