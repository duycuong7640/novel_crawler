import { ApiProperty } from '@nestjs/swagger';

import { PageMetaDto } from './page-meta.dto';

export class PageDto<T> {
  @ApiProperty({ isArray: true })
  readonly data: T[];

  @ApiProperty()
  readonly meta: PageMetaDto;

  constructor(data: T[], meta: PageMetaDto) {
    this.meta = meta;
    this.data = data;
  }
}
