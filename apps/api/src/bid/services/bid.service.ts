import { Injectable } from '@nestjs/common';
import { BidRepository } from '../entities/bid.repository';
import { CreateBidDto, UpdateBidDto } from '@libs/dto';
import {
    BidAccessNotAllowedException,
    BidCreationNotAllowedException,
    BidNotFoundException,
    ItemNotFoundException,
} from '@libs/common';
import { AuctionItemService } from '../../auction-item/services/auction-item.service';

@Injectable()
export class BidService {
    constructor(
        private readonly auctionItemService: AuctionItemService,
        private readonly bidRepo: BidRepository,
    ) {}

    async placeBid(userId: string, createBidDto: CreateBidDto) {
        const isItemExist = await this.auctionItemService.isExist(
            createBidDto.item_id,
        );
        if (!isItemExist) throw new ItemNotFoundException();

        const storedbid = await this.bidRepo.findOneByUserId(userId);
        if (storedbid)
            throw new BidCreationNotAllowedException(
                'Bidding history exists. Please update your bid.',
            );

        const bid = await this.bidRepo.create(userId, createBidDto);
        this.auctionItemService.deleteSingleItemCache(bid.item_id);
        return bid;
    }

    async updateBid(id: number, userId: string, updateBidDto: UpdateBidDto) {
        const storedBid = await this.bidRepo.findOne(id);
        if (!storedBid) throw new BidNotFoundException();
        if (storedBid.user_id !== userId)
            throw new BidAccessNotAllowedException();

        const updatedBid = await this.bidRepo.update(
            storedBid.id,
            updateBidDto,
        );
        this.auctionItemService.deleteSingleItemCache(updatedBid.item_id);
        return updatedBid;
    }
}
