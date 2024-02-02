import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuctionItem } from './auction-item.entity';
import { Brackets, Repository } from 'typeorm';
import {
    AuctionItemDto,
    CreateAuctionItemDto,
    PaginationDto,
    SearchAuctionItemsDto,
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
        const currentPrice = createAuctionItemDto.start_price;
        const item = this.repo.create({
            user_id: userId,
            ...createAuctionItemDto,
            current_price: currentPrice,
        });
        return await this.repo.save(item);
    }

    async findAllPaginated(paginationDto: PaginationDto) {
        const { skip, take } = paginationDto;

        const itemArr = await this.repo.findAndCount({
            skip: skip ?? 0,
            take: take ?? 10,
            order: { created_at: 'DESC' },
        });
        return {
            total: itemArr[1],
            count: itemArr[0].length,
            items: itemArr[0],
        };
    }

    async findOne(id: number) {
        const item = await this.repo.findOneBy({ id });
        return item;
    }

    async findOneWithBids(id: number) {
        const itemWithBids = await this.repo.findOne({
            where: { id },
            relations: ['bids'],
        });

        // 입찰 내역 정렬
        if (itemWithBids && itemWithBids.bids.length) {
            itemWithBids.bids = [
                ...itemWithBids.bids.sort((a, b) =>
                    this.descByAmount(a.bid_amount, b.bid_amount),
                ),
            ];
        }
        return itemWithBids;
    }

    async update(
        auctionItem: AuctionItem,
        updateAuctionItemDto: UpdateAuctionItemDto,
    ) {
        Object.assign(auctionItem, {
            ...updateAuctionItemDto,
            current_price: updateAuctionItemDto.start_price,
        });
        return await this.repo.save(auctionItem);
    }

    async updateStatus(id: number, status: number) {
        const result = await this.repo.update(id, { status });
        if (!result.affected) return false;
        return true;
    }

    async updateLikes(id: number, likes: number) {
        const result = await this.repo.update(id, { likes });
        if (!result.affected) return false;
        return true;
    }

    async delete(id: number) {
        const connection = this.repo.manager.connection;
        const queryRunner = connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // queryRunner를 사용하여 트랜잭션을 관리하는 경우,
            // 모든 데이터베이스 작업은 queryRunner.manager를 통해 수행되어야 한다
            const result = await queryRunner.manager.delete(AuctionItem, {
                id,
            });

            await queryRunner.commitTransaction();
            return result;
        } catch (error) {
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    async searchItems(searchDto: SearchAuctionItemsDto) {
        const itemArr = await this.createSearchQuery(
            searchDto,
        ).getManyAndCount();
        return { total: itemArr[1], items: itemArr[0] };
    }

    asAuctionItemDto(auctionItem: AuctionItem | AuctionItem[]) {
        return plainToInstance(AuctionItemDto, auctionItem, {
            excludeExtraneousValues: true,
        });
    }

    private createSearchQuery(searchDto: SearchAuctionItemsDto) {
        const { c_code, status, minPrice, maxPrice } = searchDto;
        const query = this.repo.createQueryBuilder('item');

        if (c_code) {
            const codeArr = c_code.split(',');
            query.andWhere(
                new Brackets((qb) => {
                    codeArr.forEach((v, i) => {
                        const param = `code${i}`;
                        if (i === 0) {
                            qb.where(`item.c_code = :${param}`, { [param]: v });
                        } else {
                            qb.orWhere(`item.c_code = :${param}`, {
                                [param]: v,
                            });
                        }
                    });
                }),
            );
        }

        if (status) {
            const statusArr = status.split(',');
            query.andWhere(
                new Brackets((qb) => {
                    statusArr.forEach((v, i) => {
                        const param = `status${i}`;
                        if (i === 0) {
                            qb.where(`item.status = :${param}`, { [param]: v });
                        } else {
                            qb.orWhere(`item.status = :${param}`, {
                                [param]: v,
                            });
                        }
                    });
                }),
            );
        }

        if (minPrice || maxPrice) {
            query.andWhere(
                new Brackets((qb) => {
                    if (minPrice) {
                        qb.andWhere('item.current_price >= :minPrice', {
                            minPrice,
                        });
                    }
                    if (maxPrice) {
                        qb.andWhere('item.current_price <= :maxPrice', {
                            maxPrice,
                        });
                    }
                }),
            );
        }

        return query;
    }

    private descByAmount(a: number, b: number) {
        if (a < b) return 1;
        else if (a > b) return -1;
        return 0;
    }
}
