import { NumberFieldOptional } from '../../decorators';

export class PageOptionsDto {
  @NumberFieldOptional({
    minimum: 1,
    default: 1,
    int: true,
  })
  page: number = 1;

  @NumberFieldOptional({
    minimum: 1,
    maximum: 1000,
    default: 100,
    int: true,
  })
  limit: number = 100;

  get offset(): number {
    return (this.page - 1) * this.limit;
  }
}
