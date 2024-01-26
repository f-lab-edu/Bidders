import { Injectable } from '@nestjs/common';
import { AuctionResultRepository } from '../entities/auction-result.repository';
import { CreateAuctionResultDto } from '@libs/dto';
import { AuctionItemService } from '../../auction-item/services/auction-item.service';
import {
    InvalidAuctionResultException,
    ItemNotFoundException,
    ItemStatusInvalidException,
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
        const { item_id, user_id } = createAuctionResultDto;
        const item = await this.auctionItemService.getItem(item_id);
        if (!item) throw new ItemNotFoundException();
        if (item.status !== 2)
            throw new ItemStatusInvalidException(
                'Auction result can only be created when the status is 2',
            );

        const bid = await this.bidService.getBid(item_id, user_id);
        if (bid.item_id !== createAuctionResultDto.item_id)
            throw new InvalidAuctionResultException();

        const auctionResult = await this.auctionResultRepo.create(
            bid,
            createAuctionResultDto,
        );
        return auctionResult;
    }
}
