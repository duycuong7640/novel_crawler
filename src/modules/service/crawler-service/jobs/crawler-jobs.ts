import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { forwardRef, Inject } from '@nestjs/common';
import { CrawlerJobType } from '../../../../constants/job/crawler-job-type';
import { CrawlerService } from '../services/crawler.service';

@Processor(CrawlerJobType.QUERY_JOBS.NAME)
export class CrawlerJobs {
  constructor(
    @Inject(forwardRef(() => CrawlerService))
    private readonly crawlerService: CrawlerService,
  ) {}
  @Process(CrawlerJobType.QUERY_JOBS.CREATE_CRAWLER_JOB)
  async jobUpdateCountTotalMember(job: Job<{ body: any }>) {
    return await this.crawlerService.getDetailProductChapters('', '');
  }
}
