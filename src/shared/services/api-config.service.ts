import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class ApiConfigService {
  constructor(public configService: ConfigService) {}

  private get(key: string): string {
    const value = this.configService.get<string>(key);

    if (value === null || value === undefined) {
      throw new Error(key + ' environment variable does not set'); // probably we should call process.exit() too to avoid locking the service
    }

    return value;
  }
  private getString(key: string): string {
    const value = this.get(key);

    return value.replace(/\\n/g, '\n');
  }

  private getNumber(key: string): number {
    const value = this.get(key);

    try {
      return Number(value);
    } catch {
      throw new Error(key + ' environment variable is not a number');
    }
  }

  private getBoolean(key: string): boolean {
    const value = this.get(key);

    try {
      return Boolean(JSON.parse(value));
    } catch {
      throw new Error(key + ' env var is not a boolean');
    }
  }
  get nodeEnv(): string {
    return this.getString('NODE_ENV');
  }
  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  get apiKey() {
    return this.getString('API_KEY');
  }

  get appConfig() {
    return {
      port: this.getString('PORT'),
    };
  }

  get mailConfig() {
    return {
      host: this.getString('MAIL_HOST'),
      user: this.getString('MAIL_USER'),
      password: this.getString('MAIL_PASSWORD'),
      from: this.getString('MAIL_FROM'),
    };
  }

  get domain() {
    return this.getString('DOMAIN');
  }

  get redisConfig() {
    return {
      host: this.getString('REDIS_HOST'),
      port: this.getNumber('REDIS_PORT'),
      password: this.getString('REDIS_PASSWORD'),
    };
  }

  get authConfig() {
    return {
      jwtKey: this.getString('JWT_KEY'),
      accessExpirationTime: this.getNumber('JWT_ACCESS_EXPIRATION_TIME'),
      refreshExpirationTime: this.getNumber('JWT_REFRESH_EXPIRATION_TIME'),
    };
  }

  get enableSwagger() {
    return this.getBoolean('SWAGGER_ENABLE');
  }

  get databaseConfig(): TypeOrmModuleOptions {
    const entities = [__dirname + '/../../database/entities/*.entity{.ts,.js}'];
    const migrations = [__dirname + '/../../database/migrations/*{.ts,.js}'];
    const subscribers = [__dirname + '/../../modules/**/*.subscriber{.ts,.js}'];

    return {
      entities,
      migrations,
      subscribers,
      keepConnectionAlive: !this.isTest,
      dropSchema: this.isTest,
      type: 'mysql',
      host: this.getString('DB_HOST'),
      port: this.getNumber('DB_PORT'),
      database: this.getString('DB_NAME'),
      username: this.getString('DB_USER'),
      password: this.getString('DB_PASSWORD'),
      migrationsRun: false,
      logging: true,
    };
  }
}
