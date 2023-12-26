import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionResult } from './entities/auction-result.entity';
import { AuctionResultService } from './services/auction-result.service';
import { AuctionResultRepository } from './entities/auction-result.repository';
import { AuctionResultController } from './controllers/auction-result.controller';
import { AuctionItemModule } from '../auction-item/auction-item.module';
import { BidModule } from '../bid/bid.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([AuctionResult]),
        AuctionItemModule,
        BidModule,
    ],
    controllers: [AuctionResultController],
    providers: [AuctionResultService, AuctionResultRepository],
})
export class AuctionResultModule {}
