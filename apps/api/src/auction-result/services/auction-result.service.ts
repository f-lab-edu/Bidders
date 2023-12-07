import { Injectable } from '@nestjs/common';
import { AuctionResultRepository } from '../entities/auction-result.repository';
import { CreateAuctionResultDto } from '@libs/dto';
import { AuctionItemService } from '../../auction-item/services/auction-item.service';
import {
    InvalidAuctionResultException,
    ItemNotFoundException,
} from '@libs/common';
import { BidService } from '../../bid/services/bid.service';

@Injectable()
export class AuctionResultService {
    constructor(
        private readonly auctionResultRepo: AuctionResultRepository,
        private readonly auctionItemService: AuctionItemService,
        private readonly bidService: BidService,
    ) {}

    async createAuctionResult(createAuctionResultDto: CreateAuctionResultDto) {
        const isItemExist = await this.auctionItemService.isExist(
            createAuctionResultDto.item_id,
        );
        if (!isItemExist) throw new ItemNotFoundException();

        const bid = await this.bidService.getBid(
            createAuctionResultDto.winning_bid_id,
        );
        if (bid.item_id !== createAuctionResultDto.item_id)
            throw new InvalidAuctionResultException();

        const auctionResult = await this.auctionResultRepo.create(
            bid,
            createAuctionResultDto,
        );
        return auctionResult;
    }
}
