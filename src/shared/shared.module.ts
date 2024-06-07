import { HttpModule } from '@nestjs/axios';
import { Module, Global } from '@nestjs/common';
import { ApiConfigService } from './services/api-config.service';
import { ValidatorService } from './services/validator.service';
import { GeneratorService } from './services/generator.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

const providers = [ApiConfigService, ValidatorService, GeneratorService];

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule,
  ],
  providers,
  exports: [...providers, HttpModule],
})
export class SharedModule {}
