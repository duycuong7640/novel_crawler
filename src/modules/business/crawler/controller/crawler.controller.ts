import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CrawlerService } from '../../../service/crawler-service/services/crawler.service';

@Controller('crawler')
@ApiTags('Crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Get('list-products')
  @ApiOkResponse({
    description: 'Crawler list products',
  })
  async getListProducts() {
    return 'Finished';
    // return await this.crawlerService.getListProducts();
  }

  @Get('detail-products')
  @ApiOkResponse({
    description: 'Crawler detail product',
  })
  async getDetailProduct() {
    return 'Finished';
    // return await this.crawlerService.getDetailProducts();
  }

  @Get('detail-product-chapter')
  @ApiOkResponse({
    description: 'Crawler detail product',
  })
  async getDetailProductChapter(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    // return 'Finished';
    return await this.crawlerService.getDetailProductChapters(page, limit);
  }
}
