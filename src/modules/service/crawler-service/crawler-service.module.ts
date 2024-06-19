import { Module } from '@nestjs/common';
import { CrawlerService } from './services/crawler.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../../database/entities/product.entity';
import { ProductChapter } from '../../../database/entities/productChapter.entity';
import { Author } from '../../../database/entities/author.entity';
import { Category } from '../../../database/entities/category.entity';
import { BullModule } from '@nestjs/bull';
import { CrawlerJobType } from '../../../constants/job/crawler-job-type';
import { CrawlerJobs } from './jobs/crawler-jobs';
import { ScheduleModule } from '@nestjs/schedule';

const services = [CrawlerService, CrawlerJobs];
@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Product, ProductChapter, Author]),
    BullModule.registerQueue({
      name: CrawlerJobType.QUERY_JOBS.NAME,
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [...services],
  exports: services,
})
export class CrawlerServiceModule {}
