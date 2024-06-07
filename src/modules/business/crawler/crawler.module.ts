import { Module } from '@nestjs/common';
import { CrawlerController } from './controller/crawler.controller';
import { CrawlerServiceModule } from '../../service/crawler-service/crawler-service.module';

@Module({
  imports: [CrawlerServiceModule],
  controllers: [CrawlerController],
  providers: [],
})
export class CrawlerModule {}
