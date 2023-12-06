import { Inject, Injectable } from '@nestjs/common';
import { AuctionItemRepository } from '../entities/auction-item.repository';
import {
    CreateAuctionItemDto,
    SearchAuctionItemsDto,
    UpdateAuctionItemDto,
} from '@libs/dto';
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
import { AuctionItem } from '../entities/auction-item.entity';

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
            await this.deleteItemCache();
            await this.deleteSearchCache(item);
        }
        return item;
    }

    async getItemWithBids(id: number) {
        const itemWithBids = await this.auctionItemRepo.findOneWithBids(id);
        if (!itemWithBids) throw new ItemNotFoundException();
        return itemWithBids;
    }

    async getItems() {
        const cachedItems = this.cacheManager.get('/auction/items');
        if (cachedItems) return cachedItems;

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
            await this.deleteItemCache(updatedItem.id);
            await this.deleteSearchCache(updatedItem);
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
        await this.deleteItemCache(item.id);
        await this.deleteSearchCache(item);

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
        const item = await this.auctionItemRepo.findOne(id);
        if (!item) throw new ItemNotFoundException();
        if (item.user_id !== userId) throw new AccessNotAllowedException();

        const result = await this.auctionItemRepo.delete(item.id);
        if (result.affected) {
            // 아이템 삭제시 캐시 데이터 삭제
            await this.deleteItemCache(id);
            await this.deleteSearchCache(item);
        }
        return true;
    }

    async searchItems(searchDto: SearchAuctionItemsDto) {
        if (!(await this.categoryService.isExist(searchDto.c_code)))
            throw new InvalidCategoryException();

        const cacheKey = this.createSearchCacheKey(searchDto);
        if (cacheKey === 'search:') return await this.getItems();

        let items = await this.cacheManager.get(cacheKey);

        if (!items) {
            items = await this.auctionItemRepo.searchItems(searchDto);
            await this.cacheManager.set(cacheKey, items, { ttl: 60 * 60 });
        }

        return items;
    }

    async deleteSearchCache(auctionItem: AuctionItem) {
        const keys = await this.findSearchCacheKeysToDelete(auctionItem);
        for await (const key of keys) {
            await this.cacheManager.del(key);
        }
    }

    async deleteItemCache(id?: number) {
        await this.cacheManager.del('/auction/items');
        if (id) {
            await this.cacheManager.del(`/auction/item/${id}`);
        }
    }

    private async findSearchCacheKeysToDelete(auctionItem: AuctionItem) {
        const storedKeysWithMinPrice = await this.cacheManager.store.keys(
            'search:*minPrice=*',
        );
        const storedKeysWithMaxPrice = await this.cacheManager.store.keys(
            'search:*maxPrice=*',
        );
        const storedKeysWithPrice = Array.from(
            new Set([...storedKeysWithMinPrice, ...storedKeysWithMaxPrice]),
        );

        const keysWithPrice = storedKeysWithPrice.filter((key: string) => {
            const queryParams = key.split('&').reduce((acc, v) => {
                const [_key, _value] = v.split('=');
                acc[_key] = isNaN(Number(_value)) ? _value : parseInt(_value);

                return acc;
            }, {} as Partial<SearchAuctionItemsDto>);

            const { minPrice, maxPrice } = queryParams;
            return (
                auctionItem.start_price >= minPrice &&
                auctionItem.start_price <= maxPrice
            );
        });

        const keysWithCode = await this.cacheManager.store.keys(
            `search:*c_code=${auctionItem.c_code}*`,
        );

        const keySet = new Set([...keysWithCode, ...keysWithPrice]);
        return Array.from(keySet);
    }

    private createSearchCacheKey(searchDto: SearchAuctionItemsDto) {
        const queryParts = [];
        for (const key in searchDto) {
            const value = searchDto[key];
            if (value) {
                queryParts.push(`${key}=${value}`);
            }
        }
        return `search:${queryParts.join('&')}`;
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
