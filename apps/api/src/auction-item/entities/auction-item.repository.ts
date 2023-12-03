import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuctionItem } from './auction-item.entity';
import { Repository } from 'typeorm';
import { CreateAuctionItemDto } from '@libs/dto';

@Injectable()
export class AuctionItemRepository {
    constructor(
        @InjectRepository(AuctionItem)
        private readonly repo: Repository<AuctionItem>,
    ) {}

    async create(userId: string, createAuctionItemDto: CreateAuctionItemDto) {
        const item = this.repo.create({
            user_id: userId,
            ...createAuctionItemDto,
        });
        return await this.repo.save(item);
    }
}
