import { Module } from '@nestjs/common';
import { JwtService } from './jwt';
import { CryptoService } from './crypto';
import { RedisClientModule } from '@libs/database';

@Module({
    imports: [RedisClientModule],
    providers: [CryptoService, JwtService],
    exports: [CryptoService, JwtService],
})
export class UtilModule {}
