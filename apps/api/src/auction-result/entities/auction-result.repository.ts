import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuctionResult } from './auction-result.entity';
import { Repository } from 'typeorm';
import { CreateAuctionResultDto } from '@libs/dto';
import { Bid } from '../../bid/entities/bid.entity';

@Injectable()
export class AuctionResultRepository {
    constructor(
        @InjectRepository(AuctionResult)
        private readonly repo: Repository<AuctionResult>,
    ) {}

    async create(bid: Bid, createAuctionResultDto: CreateAuctionResultDto) {
        const auctionResult = this.repo.create({
            ...createAuctionResultDto,
            final_price: bid.bid_amount,
        });
        return await this.repo.save(auctionResult);
    }
}
