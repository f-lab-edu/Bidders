import { User } from '@libs/entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';

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
            return decoded;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
