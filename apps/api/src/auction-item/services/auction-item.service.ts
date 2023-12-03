import { BadRequestException, Injectable } from '@nestjs/common';
import { AuctionItemRepository } from '../entities/auction-item.repository';
import { CreateAuctionItemDto } from '@libs/dto';

@Injectable()
export class AuctionItemService {
    constructor(private readonly auctionItemRepo: AuctionItemRepository) {}

    async createItem(
        userId: string,
        createAuctionItemDto: CreateAuctionItemDto,
    ) {
        try {
            const item = await this.auctionItemRepo.create(
                userId,
                createAuctionItemDto,
            );
            return item;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
