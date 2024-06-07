import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class ApiPrefixMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    if (!req.url.startsWith('/api')) {
      req.url = `/api${req.url}`;
    }
    next();
  }
}
