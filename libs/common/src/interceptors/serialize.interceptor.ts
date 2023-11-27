import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Observable, map } from 'rxjs';

interface ClassConstructor {
    new (...args: any[]): object;
}

export class SerializeInterceptor implements NestInterceptor {
    constructor(private dto: ClassConstructor) {}

    intercept(
        context: ExecutionContext,
        handler: CallHandler<any>,
    ): Observable<any> {
        return handler.handle().pipe(
            map((data: any) => {
                return plainToInstance(this.dto, data, {
                    excludeExtraneousValues: true,
                });
            }),
        );
    }
}
