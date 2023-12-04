import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuctionItem } from './auction-item.entity';
import { Repository } from 'typeorm';
import {
    AuctionItemDto,
    CreateAuctionItemDto,
    UpdateAuctionItemDto,
} from '@libs/dto';
import { plainToInstance } from 'class-transformer';

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

    async findAll() {
        const itemArr = await this.repo.findAndCount({
            order: { created_at: 'DESC' },
        });
        return { total: itemArr[1], items: itemArr[0] };
    }

    async findOne(id: number) {
        const item = await this.repo.findOneBy({ id });
        if (!item) throw new Error('NOT_FOUND');
        return item;
    }

    async findOneWithBids(id: number) {
        const itemWithBids = await this.repo.findOne({
            where: { id },
            relations: ['bids'],
        });
        if (!itemWithBids) throw new Error('NOT_FOUND');
        // 입찰 내역 정렬
        if (itemWithBids.bids.length) {
            itemWithBids.bids = [
                ...itemWithBids.bids.sort((a, b) =>
                    this.descByAmount(a.bid_amount, b.bid_amount),
                ),
            ];
        }
        return itemWithBids;
    }

    async update(
        id: number,
        userId: string,
        updateAuctionItemDto: UpdateAuctionItemDto,
    ) {
        const item = await this.repo.findOne({
            where: { id, user_id: userId },
        });
        if (!item) throw new Error('NOT_FOUND');
        if (item.start_datetime < new Date()) throw new Error('NOT_ALLOWED');

        Object.assign(item, updateAuctionItemDto);
        return await this.repo.save(item);
    }

    async updateStatus(id: number) {
        const item = await this.findOne(id);
        const status = item.status ? 0 : 1;
        const result = await this.repo.update(item.id, { status });
        if (!result.affected) throw new Error('UPDATE_FAILED');
        return Object.assign(item, { status });
    }

    async updateLikes(id: number) {
        const item = await this.findOne(id);
        const result = await this.repo.update(item.id, { likes: ++item.likes });
        if (!result.affected) throw new Error('UPDATE_FAILED');
        return Object.assign(item, { likes: item.likes });
    }

    async delete(id: number, userId: string) {
        const connection = this.repo.manager.connection;
        const queryRunner = connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // queryRunner를 사용하여 트랜잭션을 관리하는 경우,
            // 모든 데이터베이스 작업은 queryRunner.manager를 통해 수행되어야 한다
            const repo = queryRunner.manager.getRepository(AuctionItem);
            const item = await repo.findOneBy({ id });
            if (!item) throw new Error('NOT_FOUND');
            if (item.user_id !== userId) throw new Error('NOT_ALLOWED');

            const result = await repo.delete(id);

            await queryRunner.commitTransaction();
            return result;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new Error(error.message);
        } finally {
            await queryRunner.release();
        }
    }

    asAuctionItemDto(auctionItem: AuctionItem | AuctionItem[]) {
        return plainToInstance(AuctionItemDto, auctionItem, {
            excludeExtraneousValues: true,
        });
    }

    private descByAmount(a: number, b: number) {
        if (a < b) return 1;
        else if (a > b) return -1;
        return 0;
    }
}
