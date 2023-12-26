import { Module } from '@nestjs/common';
import { BidController } from './controllers/bid.controller';
import { BidService } from './services/bid.service';
import { BidRepository } from './entities/bid.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from './entities/bid.entity';
import { AuctionItemModule } from '../auction-item/auction-item.module';
import { UtilModule } from '@libs/util';

@Module({
    imports: [TypeOrmModule.forFeature([Bid]), UtilModule, AuctionItemModule],
    controllers: [BidController],
    providers: [BidService, BidRepository],
    exports: [BidService],
})
export class BidModule {}
