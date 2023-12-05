import { Inject, Injectable } from '@nestjs/common';
import { AuctionItemRepository } from '../entities/auction-item.repository';
import { CreateAuctionItemDto, UpdateAuctionItemDto } from '@libs/dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
    AccessNotAllowedException,
    InvalidCategoryException,
    InvalidDatetimeException,
    ItemNotFoundException,
    ItemUpdateFailedException,
    ItemUpdateNotAllowedException,
} from '@libs/common';
import { CategoryService } from '../../category/services/category.service';

@Injectable()
export class AuctionItemService {
    constructor(
        private readonly auctionItemRepo: AuctionItemRepository,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly categoryService: CategoryService,
    ) {}

    async createItem(
        userId: string,
        createAuctionItemDto: CreateAuctionItemDto,
    ) {
        await this.validateAuctionItemCreation(createAuctionItemDto);
        const item = await this.auctionItemRepo.create(
            userId,
            createAuctionItemDto,
        );
        if (item) {
            // 아이템 생성시 캐시 데이터 삭제
            await this.cacheManager.del('/auction/items');
        }
        return item;
    }

    async getItemWithBids(id: number) {
        const itemWithBids = await this.auctionItemRepo.findOneWithBids(id);
        if (!itemWithBids) throw new ItemNotFoundException();
        return itemWithBids;
    }

    async getItems() {
        const items = await this.auctionItemRepo.findAll();
        return items;
    }

    async updateItem(
        id: number,
        userId: string,
        updateAuctionItemDto: UpdateAuctionItemDto,
    ) {
        const item = await this.auctionItemRepo.findOne(id);
        if (!item) throw new ItemNotFoundException();
        if (item.status === 1 || item.start_datetime < new Date())
            throw new ItemUpdateNotAllowedException(); // 경매 진행 중일시 업데이트 불가
        if (item.user_id !== userId) throw new AccessNotAllowedException();

        const updatedItem = await this.auctionItemRepo.update(
            item,
            updateAuctionItemDto,
        );
        if (updatedItem) {
            // 아이템 업데이트시 캐시 데이터 삭제
            await this.deleteCacheItem(updatedItem.id);
        }
        return updatedItem;
    }

    async updateStatus(id: number) {
        const item = await this.auctionItemRepo.findOne(id);
        if (!item) throw new ItemNotFoundException();

        const status = item.status ? 0 : 1;
        const updated = await this.auctionItemRepo.updateStatus(
            item.id,
            status,
        );
        if (!updated) throw new ItemUpdateFailedException();

        // 아이템 업데이트시 캐시 데이터 삭제
        await this.deleteCacheItem(item.id);
        return Object.assign(item, { status });
    }

    async updateLikes(id: number) {
        const item = await this.auctionItemRepo.findOne(id);
        if (!item) throw new ItemNotFoundException();

        const updated = await this.auctionItemRepo.updateLikes(
            item.id,
            ++item.likes,
        );
        if (!updated) throw new ItemUpdateFailedException();
        return Object.assign(item, { likes: item.likes });
    }

    async deleteItem(id: number, userId: string) {
        const result = await this.auctionItemRepo.delete(id, userId);
        if (result.affected) {
            await this.deleteCacheItem(id);
        }
        return true;
    }

    async deleteCacheItem(id: number) {
        await this.cacheManager.del('/auction/items');
        await this.cacheManager.del(`/auction/item/${id}`);
    }

    private async validateAuctionItemCreation(
        createAuctionItemDto: CreateAuctionItemDto,
    ) {
        const isCategoryExist = await this.categoryService.isExist(
            createAuctionItemDto.c_code,
        );
        if (!isCategoryExist) throw new InvalidCategoryException();

        this.validateDatetime(
            createAuctionItemDto.start_datetime,
            createAuctionItemDto.end_datetime,
        );
    }

    private validateDatetime(start: string, end: string) {
        const oneHourMilliseconds = 60 * 60 * 1000;
        const now = new Date().getTime();
        const startDatetime = new Date(start).getTime();
        const endDatetime = new Date(end).getTime();
        const interval = endDatetime - startDatetime;

        if (startDatetime < now + oneHourMilliseconds)
            throw new InvalidDatetimeException(
                'Start datetime must be 1 hour later than the current datetime',
            );
        if (startDatetime >= endDatetime)
            throw new InvalidDatetimeException(
                'End datetime must be later than the start datetime',
            );
        if (interval < oneHourMilliseconds)
            throw new InvalidDatetimeException(
                'Datetime interval must be at least 1 hour',
            );
    }
}
