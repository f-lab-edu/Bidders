import { Module } from '@nestjs/common';
import { JwtService } from './jwt';
import { CryptoService } from './crypto';

@Module({
    providers: [CryptoService, JwtService],
    exports: [CryptoService, JwtService],
})
export class UtilModule {}
