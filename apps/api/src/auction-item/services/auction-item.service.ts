import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { AuctionItemRepository } from '../entities/auction-item.repository';
import { CreateAuctionItemDto, UpdateAuctionItemDto } from '@libs/dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuctionItemService {
    constructor(
        private readonly auctionItemRepo: AuctionItemRepository,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) {}

    async createItem(
        userId: string,
        createAuctionItemDto: CreateAuctionItemDto,
    ) {
        try {
            this.validateDatetime(
                createAuctionItemDto.start_datetime,
                createAuctionItemDto.end_datetime,
            );

            const item = await this.auctionItemRepo.create(
                userId,
                createAuctionItemDto,
            );
            if (item) {
                // 아이템 생성시 캐시 데이터 삭제
                await this.cacheManager.del('/auction/items');
            }
            return item;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async getItemWithBids(id: number) {
        try {
            const itemWithBids = await this.auctionItemRepo.findOneWithBids(id);
            return itemWithBids;
        } catch (error) {
            if (error.message === 'NOT_FOUND')
                throw new NotFoundException('Item not found');
            throw new BadRequestException(error.message);
        }
    }

    async getItems() {
        try {
            const result = await this.auctionItemRepo.findAll();
            return result;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async updateItem(
        id: number,
        userId: string,
        updateAuctionItemDto: UpdateAuctionItemDto,
    ) {
        try {
            const item = await this.auctionItemRepo.findOne(id);
            if (item.status === 1) throw new Error('NOT_ALLOWED'); // 경매 진행 중일시 업데이트 불가

            const updatedItem = await this.auctionItemRepo.update(
                id,
                userId,
                updateAuctionItemDto,
            );
            if (updatedItem) {
                // 아이템 업데이트시 캐시 데이터 삭제
                await this.deleteCacheItem(updatedItem.id);
            }
            return updatedItem;
        } catch (error) {
            if (error.message === 'NOT_FOUND')
                throw new NotFoundException('Item not found');
            throw new BadRequestException(error.message);
        }
    }

    async updateStatus(id: number) {
        try {
            const updatedItem = await this.auctionItemRepo.updateStatus(id);
            if (updatedItem) {
                // 아이템 업데이트시 캐시 데이터 삭제
                await this.deleteCacheItem(updatedItem.id);
            }
            return updatedItem;
        } catch (error) {
            if (error.message === 'NOT_FOUND')
                throw new NotFoundException('Item not found');
            throw new BadRequestException(error.message);
        }
    }

    async updateLikes(id: number) {
        try {
            const updatedItem = await this.auctionItemRepo.updateLikes(id);
            return updatedItem;
        } catch (error) {
            if (error.message === 'NOT_FOUND')
                throw new NotFoundException('Item not found');
            throw new BadRequestException(error.message);
        }
    }

    async deleteItem(id: number, userId: string) {
        try {
            const result = await this.auctionItemRepo.delete(id, userId);
            if (result.affected) {
                await this.deleteCacheItem(id);
            }
            return true;
        } catch (error) {
            if (error.message === 'NOT_FOUND')
                throw new NotFoundException('Item not found');
            throw new BadRequestException(error.message);
        }
    }

    async deleteCacheItem(id: number) {
        await this.cacheManager.del('/auction/items');
        await this.cacheManager.del(`/auction/item/${id}`);
    }

    private validateDatetime(start: string, end: string) {
        const oneHourMilliseconds = 60 * 60 * 1000;
        const now = new Date().getTime();
        const startDatetime = new Date(start).getTime();
        const endDatetime = new Date(end).getTime();
        const interval = endDatetime - startDatetime;

        if (startDatetime < now + oneHourMilliseconds)
            throw new Error('Invalid start datetime');
        if (startDatetime >= endDatetime)
            throw new Error('Invalid end datetime');
        if (interval < oneHourMilliseconds)
            throw new Error('Datetime interval must be at least one hour');
    }
}
