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
import { LoggerMiddleware } from '@libs/common';
import { APP_PIPE } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { CacheModule } from '@nestjs/cache-manager';
import redisStore from 'cache-manager-ioredis';
import { AuctionItemModule } from './auction-item/auction-item.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            useFactory: dataSourceConfig,
            inject: [ConfigService],
        }),
        CacheModule.registerAsync({
            useFactory: async (configService: ConfigService) => {
                return {
                    isGlobal: true,
                    store: redisStore,
                    host: configService.get('REDIS_HOST'),
                    port: configService.get('REDIS_PORT'),
                };
            },
            inject: [ConfigService],
        }),
        SwaggerModule,
        UserModule,
        AuctionItemModule,
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
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}
