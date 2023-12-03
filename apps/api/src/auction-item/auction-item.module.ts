import { Module } from '@nestjs/common';
import { AuctionItemController } from './controllers/auction-item.controller';
import { AuctionItemService } from './services/auction-item.service';
import { AuctionItemRepository } from './entities/auction-item.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionItem } from './entities/auction-item.entity';
import { UtilModule } from '@libs/util';

@Module({
    imports: [TypeOrmModule.forFeature([AuctionItem]), UtilModule],
    controllers: [AuctionItemController],
    providers: [AuctionItemService, AuctionItemRepository],
})
export class AuctionItemModule {}
