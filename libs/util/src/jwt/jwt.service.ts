import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { IExpireOpt, IUserPayload } from './interfaces/jwt.interface';
import { RedisClientService } from '@libs/database';
import { JwtMalformedException } from '@libs/common';

@Injectable()
export class JwtService {
    constructor(
        private readonly configService: ConfigService,
        private readonly redisClientService: RedisClientService,
    ) {}

    create(userPayload: IUserPayload, expiration?: string) {
        const payload = {
            id: userPayload.id,
            email: userPayload.email,
        };
        const token = jwt.sign(payload, this.configService.get('JWT_SECRET'), {
            expiresIn: expiration ?? '1h',
        });
        return token;
    }

    verify(token: string) {
        try {
            const decoded = jwt.verify(
                token,
                this.configService.get('JWT_SECRET'),
            );
            return decoded as IUserPayload;
        } catch (error) {
            throw new JwtMalformedException();
        }
    }

    delete(key: string) {
        this.redisClientService.deleteRtk(key);
    }

    async generateTokens(userPayload: IUserPayload, expireOpt: IExpireOpt) {
        const atk = this.create(userPayload, expireOpt.atk_expire);
        const rtk = this.create(userPayload, expireOpt.rtk_expire);

        await this.redisClientService.setRtk(
            userPayload.id,
            rtk,
            expireOpt.rtk_expire,
        );

        return { atk, rtk };
    }

    async validateRtk(userId: string, rtk: string) {
        const storedRtk = await this.redisClientService.getRtk(userId);
        if (rtk !== storedRtk) return false;
        return true;
    }
}
