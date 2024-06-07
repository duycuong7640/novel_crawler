import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { ApiConfigService } from './shared/services/api-config.service';
import { useContainer } from 'class-validator';
import { json, urlencoded } from 'express';
import { setupSwagger } from './docs/setup-swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.select(SharedModule).get(ApiConfigService);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      skipMissingProperties: false,
      whitelist: true,
      transform: true,
    }),
  );

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  if (configService.enableSwagger) {
    setupSwagger(app);
  }

  await app.listen(configService.appConfig.port);
}
bootstrap();
