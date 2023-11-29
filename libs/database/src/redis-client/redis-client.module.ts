import { Module } from '@nestjs/common';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { RedisClientService } from './redis-client.service';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        RedisModule.forRootAsync({
            useFactory: (configService: ConfigService) => {
                return {
                    config: {
                        host: configService.get('REDIS_HOST'),
                        port: configService.get('REDIS_PORT'),
                    },
                };
            },
            inject: [ConfigService],
        }),
    ],
    providers: [RedisClientService],
    exports: [RedisClientService],
})
export class RedisClientModule {}
