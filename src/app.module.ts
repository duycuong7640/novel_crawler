import { Module, ValidationPipe } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiConfigService } from './shared/services/api-config.service';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { BullModule } from '@nestjs/bull';
import { CrawlerModule } from './modules/business/crawler/crawler.module';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { BadRequestFilter } from './filters/bad-request.filter';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ApiConfigService) =>
        configService.databaseConfig,
      inject: [ApiConfigService],
    }),
    BullModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ApiConfigService) => ({
        redis: configService.redisConfig,
      }),
      inject: [ApiConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      renderPath: '/public/*',
    }),
    SharedModule,
    CrawlerModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: BadRequestFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(ApiPrefixMiddleware).forRoutes('*');
  // }
}
