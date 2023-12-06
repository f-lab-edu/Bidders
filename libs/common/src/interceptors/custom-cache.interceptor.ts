import {
    CallHandler,
    ExecutionContext,
    Inject,
    Injectable,
    Logger,
    NestInterceptor,
    Optional,
    StreamableFile,
} from '@nestjs/common';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import { isFunction, isNil } from '@nestjs/common/utils/shared.utils';
import { HttpAdapterHost, Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
    CACHE_KEY_METADATA,
    CACHE_MANAGER,
    CACHE_TTL_METADATA,
} from '@nestjs/cache-manager';
import { RedisClientService } from '@libs/database';

@Injectable()
export class CustomCacheInterceptor implements NestInterceptor {
    @Optional()
    @Inject()
    protected readonly httpAdapterHost: HttpAdapterHost;

    protected allowedMethods = ['GET'];

    private cacheManagerIsv5OrGreater: boolean;

    constructor(
        @Inject(CACHE_MANAGER) protected readonly cacheManager: any,
        protected readonly reflector: Reflector,
        protected readonly redisClientService: RedisClientService,
    ) {
        // We need to check if the cache-manager package is v5 or greater
        // because the set method signature changed in v5
        const cacheManagerPackage = loadPackage(
            'cache-manager',
            'CacheModule',
            () => require('cache-manager'),
        );
        this.cacheManagerIsv5OrGreater = 'memoryStore' in cacheManagerPackage;
    }

    async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<any>> {
        const key = this.trackBy(context);
        const ttlValueOrFactory =
            this.reflector.get(CACHE_TTL_METADATA, context.getHandler()) ??
            this.reflector.get(CACHE_TTL_METADATA, context.getClass()) ??
            null;

        if (!key) {
            return next.handle();
        }
        try {
            const value = await this.cacheManager.get(key);
            if (!isNil(value)) {
                //* Customize
                // const newItems = [];
                // const itemKeys = await this.redisClientService.keys('item:*');
                // for (const key of itemKeys) {
                //     const item = await this.redisClientService.get(key);
                //     newItems.push(JSON.parse(item));
                // }
                // return of([...value.items, ...newItems]);
                return of(value);
            }
            const ttl = isFunction(ttlValueOrFactory)
                ? await ttlValueOrFactory(context)
                : ttlValueOrFactory;

            return next.handle().pipe(
                tap(async (response) => {
                    if (response instanceof StreamableFile) {
                        return;
                    }

                    const args = [key, response];
                    if (!isNil(ttl)) {
                        args.push(
                            this.cacheManagerIsv5OrGreater ? ttl : { ttl },
                        );
                    }

                    try {
                        await this.cacheManager.set(...args);
                    } catch (err) {
                        Logger.error(
                            `An error has occurred when inserting "key: ${key}", "value: ${response}"`,
                            'CacheInterceptor',
                        );
                    }
                }),
            );
        } catch (error) {
            console.log(error);
            return next.handle();
        }
    }

    protected trackBy(context: ExecutionContext): string | undefined {
        const httpAdapter = this.httpAdapterHost.httpAdapter;
        const isHttpApp = httpAdapter && !!httpAdapter.getRequestMethod;
        const cacheMetadata = this.reflector.get(
            CACHE_KEY_METADATA,
            context.getHandler(),
        );

        if (!isHttpApp || cacheMetadata) {
            return cacheMetadata;
        }

        const request = context.getArgByIndex(0);
        if (!this.isRequestCacheable(context)) {
            return undefined;
        }
        return httpAdapter.getRequestUrl(request);
    }

    protected isRequestCacheable(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        return this.allowedMethods.includes(req.method);
    }
}
