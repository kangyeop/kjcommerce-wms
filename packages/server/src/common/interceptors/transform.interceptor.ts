import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta?: Record<string, any>;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const isPaginated = 
          data && 
          typeof data === 'object' && 
          'items' in data && 
          'meta' in data &&
          'totalItems' in data.meta;
          
        if (isPaginated) {
          return {
            data: data.items,
            meta: {
              ...data.meta,
            },
          };
        }
        
        return {
          data,
        };
      }),
    );
  }
}