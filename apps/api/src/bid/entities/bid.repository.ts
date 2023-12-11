import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bid } from '../entities/bid.entity';
import { Repository } from 'typeorm';
import { CreateBidDto, UpdateBidDto } from '@libs/dto';
import {
    BidCreationNotAllowedException,
    BidUpdateFailedException,
    BidUpdateNotAllowedException,
} from '@libs/common';
import { AuctionItem } from '../../auction-item/entities/auction-item.entity';

@Injectable()
export class BidRepository {
    constructor(
        @InjectRepository(Bid) private readonly repo: Repository<Bid>,
    ) {}

    async create(userId: string, createBidDto: CreateBidDto) {
        const connection = this.repo.manager.connection;
        const queryRunner = connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction('REPEATABLE READ');

        try {
            // 해당 상품은 읽기만 가능, 쓰기 불가능
            const item = await queryRunner.manager.findOne(AuctionItem, {
                where: { id: createBidDto.item_id },
                lock: { mode: 'pessimistic_read' },
            });
            if (createBidDto.bid_amount < item.start_price)
                throw new Error(
                    'Bid amount must be higher than the start price',
                );

            // 해당 입찰에 대해 읽기, 쓰기 불가능
            const latestBid = await queryRunner.manager.findOne(Bid, {
                where: { item_id: createBidDto.item_id },
                order: { bid_amount: 'DESC' },
                lock: { mode: 'pessimistic_write' },
            });

            if (latestBid && createBidDto.bid_amount <= latestBid.bid_amount)
                throw new Error(
                    'Bid amount must be higher than the current highest bid',
                );

            const bid = queryRunner.manager.create(Bid, {
                user_id: userId,
                ...createBidDto,
            });
            const savedBid = await queryRunner.manager.save(Bid, bid);

            await queryRunner.commitTransaction();

            return savedBid;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new BidCreationNotAllowedException(error.message);
        } finally {
            await queryRunner.release();
        }
    }

    async findOne(id: number) {
        const bid = await this.repo.findOneBy({ id });
        return bid;
    }

    async findOneByUserId(userId: string, itemId: number) {
        const bid = await this.repo.findOneBy({
            user_id: userId,
            item_id: itemId,
        });
        return bid;
    }

    async update(id: number, updateBidDto: UpdateBidDto) {
        const connection = this.repo.manager.connection;
        const queryRunner = connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction('REPEATABLE READ');

        try {
            const bid = await queryRunner.manager.findOne(Bid, {
                where: { id },
                lock: { mode: 'pessimistic_write' },
            });
            if (updateBidDto.bid_amount <= bid.bid_amount)
                throw new BidUpdateNotAllowedException(
                    'Can only be modified with a higher bid',
                );

            Object.assign(bid, updateBidDto);
            const updatedBid = await queryRunner.manager.save(Bid, bid);

            await queryRunner.commitTransaction();

            return updatedBid;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof BidUpdateNotAllowedException)
                throw new BadRequestException(error.message);
            throw new BidUpdateFailedException();
        } finally {
            await queryRunner.release();
        }
    }
}
