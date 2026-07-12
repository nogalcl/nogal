import "reflect-metadata";
import { resolve } from "node:path";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import type { Env } from "./config/env.validation";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService<Env, true>);

  app.enableCors({
    origin: configService.get("WEB_APP_URL"),
    credentials: false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Imágenes servidas desde disco en desarrollo. Al migrar a Cloudflare
  // R2/Supabase Storage, esta línea desaparece y publicUrl apunta al CDN.
  app.useStaticAssets(resolve(configService.get("UPLOADS_DIR")), {
    prefix: "/uploads",
  });

  const port = configService.get("PORT");
  await app.listen(port);
  console.log(`Nogal API escuchando en http://localhost:${port}/graphql`);
}

bootstrap();
