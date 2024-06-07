import { Module } from '@nestjs/common';
import { CrawlerService } from './services/crawler.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../../database/entities/product.entity';
import { ProductChapter } from '../../../database/entities/productChapter.entity';
import { Author } from '../../../database/entities/author.entity';
import { Category } from '../../../database/entities/category.entity';

const services = [CrawlerService];
@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Product, ProductChapter, Author]),
  ],
  providers: [...services],
  exports: services,
})
export class CrawlerServiceModule {}
