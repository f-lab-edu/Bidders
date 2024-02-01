import { Injectable } from '@nestjs/common';
import { BidRepository } from '../entities/bid.repository';
import { CreateBidDto } from '@libs/dto';
import {
    BidCreationNotAllowedException,
    BidNotFoundException,
    ItemNotFoundException,
    ItemStatusInvalidException,
} from '@libs/common';
import { AuctionItemService } from '../../auction-item/services/auction-item.service';
import { DataSource } from 'typeorm';
import { Bid } from '../entities/bid.entity';
import { AuctionItem } from '../../auction-item/entities/auction-item.entity';

@Injectable()
export class BidService {
    constructor(
        private readonly auctionItemService: AuctionItemService,
        private readonly bidRepo: BidRepository,
        private readonly dataSource: DataSource,
    ) {}

    async placeBid(userId: string, createBidDto: CreateBidDto) {
        await this.validateBidRequest(createBidDto);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const auctionItem = await queryRunner.manager.findOne(AuctionItem, {
                where: { id: createBidDto.item_id },
            });
            if (createBidDto.bid_amount <= auctionItem.current_price)
                throw new Error(
                    'Bid amount must be higher than the current price',
                );

            const result = await queryRunner.manager
                .createQueryBuilder()
                .update(AuctionItem, {
                    current_price: createBidDto.bid_amount,
                    version: () => 'version + 1',
                })
                .where('id = :id', { id: auctionItem.id })
                .andWhere('version = :version', {
                    version: auctionItem.version,
                })
                .execute();
            if (!result.affected) throw new Error('Transaction failed');

            const bid = queryRunner.manager.create(Bid, {
                user_id: userId,
                ...createBidDto,
            });
            await queryRunner.manager.save(Bid, bid);

            await queryRunner.commitTransaction();
            return await this.bidRepo.findOne(createBidDto.item_id, userId);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new BidCreationNotAllowedException(error.message);
        } finally {
            await queryRunner.release();
        }
    }

    async placeBidV2(userId: string, createBidDto: CreateBidDto) {
        await this.validateBidRequest(createBidDto);
        const auctionItemRepo = this.dataSource.getRepository(AuctionItem);
        const bidRepo = this.dataSource.getRepository(Bid);

        const auctionItem = await auctionItemRepo.findOne({
            where: { id: createBidDto.item_id },
        });
        if (createBidDto.bid_amount <= auctionItem.current_price)
            throw new BidCreationNotAllowedException(
                'Bid amount must be higher than the current price',
            );

        const result = await auctionItemRepo
            .createQueryBuilder()
            .update({
                current_price: createBidDto.bid_amount,
                version: () => 'version + 1',
            })
            .where('id = :id', { id: auctionItem.id })
            .andWhere('version = :version', {
                version: auctionItem.version,
            })
            .execute();
        if (!result.affected)
            throw new BidCreationNotAllowedException('Bid creation failed');

        const bid = bidRepo.create({
            user_id: userId,
            ...createBidDto,
        });
        await bidRepo.save(bid);

        return await this.bidRepo.findOne(createBidDto.item_id, userId);
    }

    async placeBidDeprecated(userId: string, createBidDto: CreateBidDto) {
        await this.validateBidRequest(createBidDto);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const latestBid = await queryRunner.manager.findOne(Bid, {
                where: { item_id: createBidDto.item_id },
                order: { bid_amount: 'DESC' },
            });
            if (latestBid && createBidDto.bid_amount <= latestBid.bid_amount)
                throw new Error(
                    'Bid amount must be higher than the current highest bid',
                );

            const auctionItem = await queryRunner.manager.findOne(AuctionItem, {
                where: { id: createBidDto.item_id },
            });
            auctionItem.current_price = createBidDto.bid_amount;
            await queryRunner.manager.save(AuctionItem, auctionItem);

            const bid = queryRunner.manager.create(Bid, {
                user_id: userId,
                ...createBidDto,
            });
            await queryRunner.manager.save(Bid, bid);

            await queryRunner.commitTransaction();
            return await this.bidRepo.findOne(createBidDto.item_id, userId);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new BidCreationNotAllowedException(error.message);
        } finally {
            await queryRunner.release();
        }
    }

    async getBid(itemId: number, userId: string) {
        const bid = await this.bidRepo.findOne(itemId, userId);
        if (!bid) throw new BidNotFoundException();
        return bid;
    }

    private async validateBidRequest(createBidDto: CreateBidDto) {
        const item = await this.auctionItemService.getItem(
            createBidDto.item_id,
        );
        if (!item) throw new ItemNotFoundException();
        if (item.status !== 1)
            throw new ItemStatusInvalidException(
                'Bidding is possible only when the status is 1',
            );
        if (createBidDto.bid_amount < item.start_price) {
            throw new BidCreationNotAllowedException(
                'Bid amount must be same or higher than the start price',
            );
        }
    }
}
