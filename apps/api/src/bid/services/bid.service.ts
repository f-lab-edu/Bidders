import { Injectable } from '@nestjs/common';
import { BidRepository } from '../entities/bid.repository';
import { CreateBidDto, UpdateBidDto } from '@libs/dto';
import {
    BidAccessNotAllowedException,
    BidNotFoundException,
    DuplicateBidCreationException,
    ItemNotFoundException,
    ItemStatusInvalidException,
} from '@libs/common';
import { AuctionItemService } from '../../auction-item/services/auction-item.service';

@Injectable()
export class BidService {
    constructor(
        private readonly auctionItemService: AuctionItemService,
        private readonly bidRepo: BidRepository,
    ) {}

    async placeBid(userId: string, createBidDto: CreateBidDto) {
        const item = await this.auctionItemService.getItem(
            createBidDto.item_id,
        );
        if (!item) throw new ItemNotFoundException();
        if (item.status !== 1)
            throw new ItemStatusInvalidException(
                'Bidding is possible only when the status is 1',
            );

        const storedbid = await this.bidRepo.findOneByUserId(userId, item.id);
        if (storedbid)
            throw new DuplicateBidCreationException(
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

        const item = await this.auctionItemService.getItem(storedBid.item_id);
        if (item.status !== 1)
            throw new ItemStatusInvalidException(
                'Bidding is possible only when the status is 1',
            );

        const updatedBid = await this.bidRepo.update(
            storedBid.id,
            updateBidDto,
        );
        this.auctionItemService.deleteSingleItemCache(updatedBid.item_id);
        return updatedBid;
    }

    async getBid(id: number) {
        const bid = await this.bidRepo.findOne(id);
        if (!bid) throw new BidNotFoundException();
        return bid;
    }
}
