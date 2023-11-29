import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
    async hash(text: string) {
        const saltRounds = 10;
        const hashed = await bcrypt.hash(text, saltRounds);
        return hashed;
    }

    async compare(plainText: string, hashedText: string) {
        const match = await bcrypt.compare(plainText, hashedText);
        if (!match) return false;
        return true;
    }
}
