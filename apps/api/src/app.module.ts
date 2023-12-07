import {
    MiddlewareConsumer,
    Module,
    NestModule,
    ValidationPipe,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SwaggerModule } from '@libs/swagger';
import { dataSourceConfig } from '@libs/database';
import { GlobalExceptionFilter, LoggerMiddleware } from '@libs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { CacheModule } from '@nestjs/cache-manager';
import redisStore from 'cache-manager-ioredis';
import { AuctionItemModule } from './auction-item/auction-item.module';
import { CategoryModule } from './category/category.module';
import { BidModule } from './bid/bid.module';
import { AuctionResultModule } from './auction-result/auction-result.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            useFactory: dataSourceConfig,
            inject: [ConfigService],
        }),
        CacheModule.registerAsync({
            isGlobal: true,
            useFactory: async (configService: ConfigService) => {
                return {
                    store: redisStore,
                    host: configService.get('REDIS_HOST'),
                    port: configService.get('REDIS_PORT'),
                };
            },
            inject: [ConfigService],
        }),
        SwaggerModule,
        UserModule,
        CategoryModule,
        AuctionItemModule,
        BidModule,
        AuctionResultModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({
                whitelist: true,
                transform: true,
            }),
        },
        {
            provide: APP_FILTER,
            useClass: GlobalExceptionFilter,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}
