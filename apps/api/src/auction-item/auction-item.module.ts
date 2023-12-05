import { Module } from '@nestjs/common';
import { AuctionItemController } from './controllers/auction-item.controller';
import { AuctionItemService } from './services/auction-item.service';
import { AuctionItemRepository } from './entities/auction-item.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionItem } from './entities/auction-item.entity';
import { UtilModule } from '@libs/util';
import { RedisClientService } from '@libs/database';
import { CategoryModule } from '../category/category.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([AuctionItem]),
        UtilModule,
        CategoryModule,
    ],
    controllers: [AuctionItemController],
    providers: [AuctionItemService, AuctionItemRepository, RedisClientService],
})
export class AuctionItemModule {}
