import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PageMetaDto } from '../common/dto/page-meta.dto';

interface ClassConstructor {
  new (...args: any[]): {};
}

export enum ResponseType {
  OBJECT,
  LIST,
}

export function Serialize(dto: ClassConstructor, responseType?: ResponseType) {
  if (!responseType) responseType = ResponseType.OBJECT;
  return UseInterceptors(new SerializeInterceptor(dto, responseType));
}

export class SerializeInterceptor implements NestInterceptor {
  // tslint:disable-next-line
  constructor(private dto: any, private responseType?: ResponseType) {}
  // tslint:disable-next-line
  async intercept(
    context: ExecutionContext,
    handler: CallHandler,
  ): Promise<Observable<any>> {
    return handler.handle().pipe(
      // tslint:disable-next-line
      map((result: any) => {
        return this.responseType === ResponseType.OBJECT
          ? plainToClass(this.dto, result, {
              excludeExtraneousValues: true,
            })
          : {
              meta: result.meta as PageMetaDto,
              data: plainToClass(this.dto, result.data, {
                excludeExtraneousValues: true,
              }),
            };
      }),
    );
  }
}
