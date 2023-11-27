import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from 'apps/api/src/user/entities/user.entity';
import jwt from 'jsonwebtoken';
import { IUserPayload } from './interfaces/jwt.interface';

@Injectable()
export class JwtService {
    constructor(private readonly configService: ConfigService) {}

    create(user: User, expiration?: string) {
        const payload = {
            id: user.id,
            email: user.email,
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
            throw new Error('JWT_MALFORMED');
        }
    }
}
