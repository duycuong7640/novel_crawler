import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { GeneratorService } from '../../../../shared/services/generator.service';
import puppeteer from 'puppeteer';
import { Product } from '../../../../database/entities/product.entity';
import slugify from 'slugify';
import {
  ProductChapter,
  TABLE_PRODUCT_CHAPTER,
} from '../../../../database/entities/productChapter.entity';
import {
  Author,
  TABLE_AUTHOR,
} from '../../../../database/entities/author.entity';
import {
  Category,
  TABLE_CATEGORY,
} from '../../../../database/entities/category.entity';
import { InjectQueue } from '@nestjs/bull';
import { CrawlerJobType } from '../../../../constants/job/crawler-job-type';
import { Queue } from 'bull';
import * as path from 'path';
import * as fs from 'fs';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CrawlerService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductChapter)
    private productChapterRepository: Repository<ProductChapter>,
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
    private generatorService: GeneratorService,
    @InjectQueue(CrawlerJobType.QUERY_JOBS.NAME)
    private readonly usedQueue: Queue,
  ) {}

  async getListProducts(): Promise<boolean> {
    const browser = await puppeteer.launch({ headless: false });
    // const page = await browser.newPage();

    // await page.goto('https://www.mtlnovel.com/novel-list/');
    // await page.waitForSelector('#pagination');

    // const pageLinks = await page.$$eval('#pagination a', (links) => {
    //   return links.map((link) => link.href);
    // });

    // for (const link of pageLinks) {
    //   await this.getPagesData(browser, link);
    //   await new Promise((resolve) => setTimeout(resolve, 2000));
    // }

    for (let i = 1; i <= 188; i++) {
      if (i === 1) {
        await this.getPagesData(
          browser,
          `https://www.mtlnovel.com/novel-list/`,
        );
      } else {
        await this.getPagesData(
          browser,
          `https://www.mtlnovel.com/novel-list/?orderby=date&order=desc&status=all&pg=${i}`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    await browser.close();

    return true;
  }

  async getPagesData(browser, link) {
    try {
      const page = await browser.newPage();

      await page.goto(link);
      await page.waitForSelector('.main-title');

      const boxes = await page.$$('.box.wide');
      for (const box of boxes) {
        const imgHref = await box.$eval(
          '.tmb-left a amp-img amp-img',
          (element) => element.getAttribute('src'),
        );

        const href = await box.$eval('.data-r a', (element) =>
          element.getAttribute('href'),
        );

        const title = await box.$eval('.data-r a.list-title', (element) =>
          element.textContent.trim(),
        );

        const views = await box.$eval('.meta .views', (element) =>
          element.textContent.trim(),
        );

        if (title && imgHref && href) {
          const checkExits = await this.productRepository.findOneBy({
            url_mtlnovel_com: href,
          });
          if (!checkExits) {
            console.log('11111');
            const entity = await this.productRepository.create({
              id: this.generatorService.generateSnowflakeId(),
              uuid: this.generatorService.uuid(),
              title: title,
              slug: slugify(title, { lower: true }),
              thumbnail_root: imgHref,
              view: this.generatorService.convertViewCrawler(views),
              url_mtlnovel_com: href,
            });
            await this.productRepository.save(entity);
          } else {
            console.log('222');
            console.log(checkExits.url_mtlnovel_com);
            console.log(imgHref);
            // const updateProduct = await this.productRepository.findOneBy({
            //   url_mtlnovel_com: href,
            //   thumbnail: IsNull(),
            // });
            if (!checkExits.thumbnail) {
              checkExits.thumbnail_root = imgHref;
              await this.productRepository.save(checkExits);
            }
          }
        }
      }

      await page.close();

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async getDetailProducts(): Promise<boolean> {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const products = await this.productRepository.find({
      where: {
        is_crawler_chapter: false,
      },
      order: { view: 'DESC' },
      // take: 100,
    });

    for (let i = 0; i < products.length; i++) {
      await this.getDetailProduct(products[i], browser, page);
    }

    await page.close();

    return true;
  }

  async getDetailProduct(product: Product, browser: any, page: any) {
    try {
      await page.goto(product.url_mtlnovel_com);
      await page.waitForSelector('#panelnovelinfo .desc');

      // info product
      const rate = await page.$eval(
        '.post-content .nov-head .ratings .rating-info strong',
        (element) => element.textContent.trim(),
      );

      const title_short = await page.$eval(
        '.info tbody tr td#shorttitle',
        (element) => element.textContent.trim(),
      );

      const title_alternate = await page.$eval(
        '.info tbody tr td#alt',
        (element) => element.textContent.trim(),
      );

      const author = await page.$eval('.info tbody tr td#author a', (element) =>
        element.innerHTML.trim(),
      );

      const tags = await page.evaluate(() => {
        const tagElement = document.querySelector('.info tbody tr td#tags');
        const keywordLinks = tagElement.querySelectorAll('a');
        const keywords = Array.from(keywordLinks).map((link) =>
          link.textContent.trim(),
        );
        return keywords;
      });

      const categories = await page.evaluate(() => {
        const tagElement = document.querySelector(
          '.info tbody tr td#genre #currentgen',
        );
        const cateLinks = tagElement.querySelectorAll('a');
        const categories = Array.from(cateLinks).map((link) =>
          link.textContent.trim(),
        );
        return categories;
      });

      const content = await page.$eval(
        '.post-content #panelnovelinfo .desc',
        (element) =>
          element.textContent
            .trim()
            .replace(/<h2>.*?<\/h2>|<p class="descr">.*?<\/p>/gs, ''),
      );

      // save info product
      product.rate = rate.toString();
      product.title_short = title_short;
      product.title_alternate = title_alternate;
      product.tags = tags.join(',');
      product.content = content;
      product.type = 'product';

      const checkAuthor = await this.authorRepository
        .createQueryBuilder(TABLE_AUTHOR)
        .where(
          `LOWER(${TABLE_AUTHOR}.title) = LOWER('${author.replace(
            /'/g,
            '"',
          )}')`,
        )
        .getOne();
      if (!checkAuthor) {
        const authorEntity = await this.authorRepository.create({
          id: this.generatorService.generateSnowflakeId(),
          uuid: this.generatorService.uuid(),
          title: author,
          slug: slugify(author, { lower: true }),
          type: 'author',
          status: 1,
        });
        await this.authorRepository.save(authorEntity);

        product.author_id = authorEntity.id;
      } else {
        product.author_id = checkAuthor.id;
      }

      const categories_multi = [];
      for (let i = 0; i < categories.length; i++) {
        const checkCate = await this.categoryRepository
          .createQueryBuilder(TABLE_CATEGORY)
          .where(
            `LOWER(${TABLE_CATEGORY}.title) = LOWER('${categories[i].replace(
              /'/g,
              '"',
            )}')`,
          )
          .getOne();
        if (!checkCate) {
          const cateEntity = await this.categoryRepository.create({
            id: this.generatorService.generateSnowflakeId(),
            uuid: this.generatorService.uuid(),
            parent_id: '1',
            user_id: '1',
            title: categories[i],
            slug: slugify(categories[i], { lower: true }),
            type: 'product',
            status: 1,
          });
          await this.categoryRepository.save(cateEntity);

          if (!product.category_id) product.category_id = cateEntity.id;
          categories_multi.push(cateEntity.id);
        } else {
          if (!product.category_id) product.category_id = checkCate.id;
          categories_multi.push(checkCate.id);
        }
      }
      if (categories_multi)
        product.category_multi = `|${categories_multi.join('|')}|`;

      await this.productRepository.save(product);

      // get chapters
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await this.getProductChapters(product, browser, page);

      // await page.close();
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async getProductChapters(product: Product, browser: any, page: any) {
    try {
      await page.goto(`${product.url_mtlnovel_com}chapter-list/`);
      await page.waitForSelector('.post-content .ch-list');

      const chapters = await page.evaluate(() => {
        const tagElement = document.querySelector('.post-content .ch-list');
        const cateLinks = tagElement.querySelectorAll('a');
        return {
          href: Array.from(cateLinks)
            .map((link) => link.getAttribute('href'))
            .reverse(),
          text: Array.from(cateLinks)
            .map((link) =>
              link.textContent.trim().replace(/^Chapter \d+ \d+: /, ''),
            )
            .reverse(),
        };
      });

      const entityProductChapters = [];
      const checkLink = [];
      for (let i = 0; i < chapters.href.length; i++) {
        // const productChapter = await this.productChapterRepository
        //   .createQueryBuilder(TABLE_PRODUCT_CHAPTER)
        //   .where(
        //     `LOWER(${TABLE_PRODUCT_CHAPTER}.url_mtlnovel_com) = LOWER('${chapters.href[
        //       i
        //     ].replace(/'/g, '"')}')`,
        //   )
        //   .getOne();
        // if (!productChapter) {
        if (!checkLink.includes(chapters.href[i])) {
          const entityProductChapter =
            await this.productChapterRepository.create({
              id: this.generatorService.generateSnowflakeId(),
              uuid: this.generatorService.uuid(),
              product_id: product.id,
              title: chapters.text[i],
              slug: slugify(chapters.text[i], { lower: true }),
              url_mtlnovel_com: chapters.href[i],
              rank: i + 1,
              status: 1,
            });
          entityProductChapters.push(entityProductChapter);
          checkLink.push(chapters.href[i]);
        }
        // }
      }

      if (entityProductChapters.length) {
        await this.productChapterRepository.save(entityProductChapters);

        const productEntity = await this.productRepository.findOneBy({
          id: product.id,
        });
        productEntity.total_chap = entityProductChapters.length;
        productEntity.is_crawler_chapter = true;
        await this.productRepository.save(productEntity);
      }

      // await page.close();
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async getDetailProductChapters(
    pageS: string,
    limit: string,
  ): Promise<boolean> {
    // const productChapters = await this.productChapterRepository.find({
    //   where: {
    //     is_crawler_chapter: false,
    //   },
    //   order: { id: 'ASC' },
    //   take: 8000,
    // });

    // const offset = (parseInt(pageS) - 1) * parseInt(limit);
    // const productChapters = await this.productChapterRepository.find({
    //   where: {
    //     is_crawler_chapter: false,
    //     status: 1,
    //   },
    //   skip: offset,
    //   take: parseInt(limit),
    // });
    //
    // for (let i = 0; i < productChapters.length; i++) {
    //   const browser = await puppeteer.launch({
    //     headless: true,
    //     args: ['--no-sandbox', '--disable-setuid-sandbox'],
    //   });
    //   const page = await browser.newPage();
    //
    //   // Clear browser cache
    //   const client = await page.target().createCDPSession();
    //   await client.send('Network.clearBrowserCache');
    //
    //   await page.setUserAgent(
    //     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    //   );
    //   await page.setJavaScriptEnabled(true);
    //
    //   await this.getDetailProductChapter(productChapters[i], browser, page);
    //
    //   await page.close();
    // }

    const agents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
      'Mozilla/5.0 (iPad; CPU OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/79.0.3945.73 Mobile/15E148 Safari/604.1',
    ];
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];

    // while (true) {
    const productChapters = await this.productChapterRepository.find({
      where: {
        is_crawler_chapter: false,
        status: 1,
      },
      take: 20,
    });

    if (productChapters && productChapters.length) {
      let flag = true;
      for (let i = 0; i < productChapters.length; i++) {
        try {
          // const userDataDir = path.join(__dirname, 'tmp_user_data');

          const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            // userDataDir: userDataDir,
          });

          const page = await browser.newPage();

          // Clear browser cache
          const client = await page.target().createCDPSession();
          await client.send('Network.clearBrowserCache');
          await client.send('Network.clearBrowserCookies');

          // Clear storage
          await client.send('Storage.clearDataForOrigin', {
            origin: '*',
            storageTypes: 'all',
          });

          await client.send('Network.setCacheDisabled', {
            cacheDisabled: true,
          });

          await page.setCacheEnabled(false);

          await page.setUserAgent(
            randomAgent,
            // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          );
          await page.setJavaScriptEnabled(true);

          await this.getDetailProductChapter(productChapters[i], browser, page);

          await page.close();

          // if (fs.existsSync(userDataDir)) {
          //   fs.rmSync(userDataDir, { recursive: true, force: true });
          // }

          flag = true;
        } catch (e) {
          console.log(productChapters[i].url_mtlnovel_com);
          console.log(e);
          console.log('....');
          flag = false;
        }
      }

      // if (flag) {
      //   await this.usedQueue.add(
      //     CrawlerJobType.QUERY_JOBS.CREATE_CRAWLER_JOB,
      //     {},
      //     {
      //       removeOnComplete: true,
      //       delay: 200000,
      //       removeOnFail: true,
      //     },
      //   );
      // }
    }
    // else {
    //   break;
    // }
    // }

    return true;
  }

  async getDetailProductChapter(
    productChapter: ProductChapter,
    browser: any,
    page: any,
  ) {
    try {
      await page.goto(productChapter.url_mtlnovel_com);

      await page.waitForSelector('.post-content .par');
      const content = await page.evaluate(() => {
        return document.querySelector('.post-content .par').innerHTML;
      });

      if (content) {
        productChapter.content = content;
        productChapter.created_at = new Date();
        productChapter.updated_at = new Date();
        productChapter.is_crawler_chapter = true;
        await this.productChapterRepository.save(productChapter);

        const entity = await this.productRepository.findOneBy({
          id: productChapter.product_id,
        });
        if (entity) {
          entity.updated_at = new Date();
          await this.productRepository.save(entity);
        }
      } else {
        console.log('is_content_null');
        productChapter.created_at = new Date();
        productChapter.updated_at = new Date();
        productChapter.status = 2;
        await this.productChapterRepository.save(productChapter);

        const entity = await this.productRepository.findOneBy({
          id: productChapter.product_id,
        });
        if (entity) {
          entity.updated_at = new Date();
          await this.productRepository.save(entity);
        }
      }

      // await new Promise((resolve) => setTimeout(resolve, 1000));
      return true;
    } catch (e) {
      return true;
    }
  }
}
