import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class RedisClientService {
    constructor(@InjectRedis() private readonly redis: Redis) {}

    async setRtk(key: string, value: string, expiration: string) {
        const second = this.convertToSeconds(expiration);
        await this.redis.set(key, value, 'EX', second);
    }

    async getRtk(key: string) {
        const rtk = await this.redis.get(key);
        return rtk;
    }

    deleteRtk(key: string) {
        this.redis.del(key);
    }

    private convertToSeconds(timeStr: string) {
        const unit = timeStr.slice(-1);
        const value = parseInt(timeStr.slice(0, -1));

        switch (unit) {
            case 's': // 초
                return value;
            case 'm': // 분
                return value * 60;
            case 'h': // 시간
                return value * 60 * 60;
            case 'd': // 일
                return value * 24 * 60 * 60;
            default:
                throw new Error('Unsupported time unit');
        }
    }
}
