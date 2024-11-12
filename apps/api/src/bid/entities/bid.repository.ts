import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bid } from '../entities/bid.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BidRepository {
    constructor(
        @InjectRepository(Bid) private readonly repo: Repository<Bid>,
    ) {}

    async findOne(itemId: number, userId: string) {
        const bid = await this.repo.findOneBy({
            item_id: itemId,
            user_id: userId,
        });
        return bid;
    }
}
