import { Test } from '@nestjs/testing';
import { CategoryService } from '../../category/services/category.service';
import { AuctionItemRepository } from '../entities/auction-item.repository';
import { AuctionItemService } from './auction-item.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
    CreateAuctionItemDto,
    SearchAuctionItemsDto,
    UpdateAuctionItemDto,
} from '@libs/dto';
import { AuctionItem } from '../entities/auction-item.entity';
import {
    InvalidCategoryException,
    InvalidDatetimeException,
    ItemAccessNotAllowedException,
    ItemNotFoundException,
    ItemUpdateFailedException,
    ItemUpdateNotAllowedException,
} from '@libs/common';

describe('AuctionItemService', () => {
    let service: AuctionItemService;
    let fakeAuctionItemRepo: Partial<AuctionItemRepository>;
    let fakeCacheManager: Partial<Cache>;
    let fakeCategoryService: Partial<CategoryService>;

    const mockAuctionItem = {
        id: 1,
        title: 'Test item',
        user_id: 'qwer-asdf-zxcv',
        status: 0,
        likes: 0,
        start_datetime: new Date('2999-12-24 00:00:00'),
    } as AuctionItem;
    const mockAuctionItemWithBids = { id: 1, title: 'Test Item', bids: [] };
    const mockAuctionItemsObj = { total: 1, items: [mockAuctionItem] };
    const createAuctionItemDto: CreateAuctionItemDto = {
        c_code: '0001',
        title: 'Test item',
        content: 'Test item content',
        image: 'Test item image',
        start_datetime: new Date('2999-12-24 00:00:00').toISOString(),
        end_datetime: new Date('2999-12-25 00:00:00').toISOString(),
        start_price: 1000,
    };
    const updateAuctionItemDto: UpdateAuctionItemDto = {
        c_code: '0001',
        title: 'Updated test item',
        content: 'Test item content',
        image: 'Test item image',
        start_datetime: new Date('2999-12-24 00:00:00').toISOString(),
        end_datetime: new Date('2999-12-25 00:00:00').toISOString(),
        start_price: 1000,
    };

    beforeEach(async () => {
        fakeAuctionItemRepo = {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findOneWithBids: jest.fn(),
            update: jest.fn(),
            updateStatus: jest.fn(),
            updateLikes: jest.fn(),
            delete: jest.fn(),
            searchItems: jest.fn(),
            asAuctionItemDto: jest.fn(),
        };

        fakeCacheManager = {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            store: {
                keys: jest.fn().mockReturnValue([]),
                get: jest.fn(),
                set: jest.fn(),
            },
        };

        fakeCategoryService = {
            isExist: jest.fn(),
        };

        const module = await Test.createTestingModule({
            providers: [
                AuctionItemService,
                {
                    provide: AuctionItemRepository,
                    useValue: fakeAuctionItemRepo,
                },
                {
                    provide: CACHE_MANAGER,
                    useValue: fakeCacheManager,
                },
                {
                    provide: CategoryService,
                    useValue: fakeCategoryService,
                },
            ],
        }).compile();

        service = module.get(AuctionItemService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createItem', () => {
        it('should create an item', async () => {
            fakeAuctionItemRepo.create = jest
                .fn()
                .mockResolvedValueOnce(mockAuctionItem);
            fakeCategoryService.isExist = jest.fn().mockResolvedValueOnce(true);

            expect(
                await service.createItem(
                    'qwer-asdf-zxcv',
                    createAuctionItemDto,
                ),
            ).toEqual(mockAuctionItem);
        });

        it('should throw InvalidCategoryException if category does not exist', async () => {
            fakeCategoryService.isExist = jest
                .fn()
                .mockResolvedValueOnce(false);

            await expect(
                service.createItem('qwer-asdf-zxcv', createAuctionItemDto),
            ).rejects.toThrow(InvalidCategoryException);
        });

        it('should throw InvalidDatetimeException if datetime format is invalid', async () => {
            createAuctionItemDto.end_datetime =
                createAuctionItemDto.start_datetime;
            fakeCategoryService.isExist = jest.fn().mockResolvedValueOnce(true);

            await expect(
                service.createItem('qwer-asdf-zxcv', createAuctionItemDto),
            ).rejects.toThrow(InvalidDatetimeException);
        });
    });

    describe('getItemWithBids', () => {
        it('should throw ItemNotFoundException if item does not exist', async () => {
            fakeAuctionItemRepo.findOneWithBids = jest
                .fn()
                .mockResolvedValueOnce(null);

            await expect(service.getItemWithBids(1)).rejects.toThrow(
                ItemNotFoundException,
            );
        });

        it('should get an item with bids', async () => {
            fakeAuctionItemRepo.findOneWithBids = jest
                .fn()
                .mockResolvedValueOnce(mockAuctionItemWithBids);

            expect(await service.getItemWithBids(1)).toHaveProperty(
                'bids',
                mockAuctionItemWithBids.bids,
            );
        });
    });

    describe('getItems', () => {
        it('should get items', async () => {
            fakeCacheManager.get = jest.fn().mockResolvedValueOnce(null);
            fakeAuctionItemRepo.findAll = jest
                .fn()
                .mockResolvedValueOnce(mockAuctionItemsObj);

            expect(await service.getItems()).toBeDefined();
        });
    });

    describe('updateItem', () => {
        it('should throw ItemNotFoundException if item does not exist', async () => {
            const id = 1;
            const userId = 'qwer-asdf-zxcv';
            fakeAuctionItemRepo.findOne = jest.fn().mockResolvedValueOnce(null);

            await expect(
                service.updateItem(id, userId, updateAuctionItemDto),
            ).rejects.toThrow(ItemNotFoundException);
        });

        it('should throw ItemUpdateNotAllowedException if item status is 1', async () => {
            const id = 1;
            const userId = 'qwer-asdf-zxcv';
            fakeAuctionItemRepo.findOne = jest.fn().mockResolvedValueOnce({
                id,
                user_id: userId,
                status: 1,
            } as AuctionItem);

            await expect(
                service.updateItem(id, userId, updateAuctionItemDto),
            ).rejects.toThrow(ItemUpdateNotAllowedException);
        });

        it('should throw ItemAccessNotAllowedException if user_id is different', async () => {
            const id = 1;
            const userId = 'qwer-asdf-zxcv';
            fakeAuctionItemRepo.findOne = jest.fn().mockResolvedValueOnce({
                id,
                user_id: 'zxcv-asdf-qwer',
            } as AuctionItem);

            await expect(
                service.updateItem(id, userId, updateAuctionItemDto),
            ).rejects.toThrow(ItemAccessNotAllowedException);
        });

        it('should update an item', async () => {
            const id = 1;
            const userId = 'qwer-asdf-zxcv';
            const updatedData = { id: 1, title: 'Update-test' };

            fakeAuctionItemRepo.findOne = jest
                .fn()
                .mockResolvedValueOnce(mockAuctionItem);
            fakeAuctionItemRepo.update = jest.fn().mockResolvedValueOnce({
                ...mockAuctionItem,
                ...updatedData,
            } as AuctionItem);

            expect(
                await service.updateItem(id, userId, updateAuctionItemDto),
            ).toEqual({ ...mockAuctionItem, ...updatedData });
        });
    });

    describe('updateStatus', () => {
        it('should throw ItemNotFoundException if item does not exist', async () => {
            fakeAuctionItemRepo.findOne = jest.fn().mockResolvedValueOnce(null);

            await expect(service.updateStatus(1)).rejects.toThrow(
                ItemNotFoundException,
            );
        });

        it('should throw ItemUpdateFailedException if item update status failed', async () => {
            fakeAuctionItemRepo.findOne = jest
                .fn()
                .mockResolvedValueOnce(mockAuctionItem);
            fakeAuctionItemRepo.updateStatus = jest
                .fn()
                .mockResolvedValueOnce(false);

            await expect(service.updateStatus(1)).rejects.toThrow(
                ItemUpdateFailedException,
            );
        });

        it('should update item status', async () => {
            fakeAuctionItemRepo.findOne = jest
                .fn()
                .mockResolvedValueOnce(mockAuctionItem);
            fakeAuctionItemRepo.updateStatus = jest
                .fn()
                .mockResolvedValueOnce(true);
            const updatedAuctionItem = await service.updateStatus(1);

            expect(updatedAuctionItem.status).toBe(1);
        });
    });

    describe('updateLikes', () => {
        it('should throw ItemNotFoundException if item does not exist', async () => {
            fakeAuctionItemRepo.findOne = jest.fn().mockResolvedValueOnce(null);

            await expect(service.updateLikes(1)).rejects.toThrow(
                ItemNotFoundException,
            );
        });

        it('should throw ItemUpdateFailedException if item update likes failed', async () => {
            fakeAuctionItemRepo.findOne = jest
                .fn()
                .mockResolvedValueOnce(mockAuctionItem);
            fakeAuctionItemRepo.updateLikes = jest
                .fn()
                .mockResolvedValueOnce(false);

            await expect(service.updateLikes(1)).rejects.toThrow(
                ItemUpdateFailedException,
            );
        });

        it('should update item likes', async () => {
            fakeAuctionItemRepo.findOne = jest
                .fn()
                .mockResolvedValueOnce(mockAuctionItem);
            fakeAuctionItemRepo.updateLikes = jest
                .fn()
                .mockResolvedValueOnce(true);
            const updatedAuctionItem = await service.updateLikes(1);

            expect(updatedAuctionItem.likes).toBeGreaterThan(0);
        });
    });

    describe('deleteItem', () => {
        it('should throw ItemNotFoundException if item does not exist', async () => {
            const id = 1;
            const userId = 'qwer-asdf-zxcv';
            fakeAuctionItemRepo.findOne = jest.fn().mockResolvedValueOnce(null);

            await expect(service.deleteItem(id, userId)).rejects.toThrow(
                ItemNotFoundException,
            );
        });

        it('should throw ItemAccessNotAllowedException if user_id is different', async () => {
            const id = 1;
            const userId = 'qwer-asdf-zxcv';
            fakeAuctionItemRepo.findOne = jest.fn().mockResolvedValueOnce({
                id,
                user_id: 'zxcv-asdf-qwer',
            } as AuctionItem);

            await expect(service.deleteItem(id, userId)).rejects.toThrow(
                ItemAccessNotAllowedException,
            );
        });

        it('should delete an item', async () => {
            const id = 1;
            const userId = 'qwer-asdf-zxcv';
            fakeAuctionItemRepo.findOne = jest
                .fn()
                .mockResolvedValueOnce(mockAuctionItem);
            fakeAuctionItemRepo.delete = jest
                .fn()
                .mockResolvedValueOnce({ affected: 1 });

            expect(await service.deleteItem(id, userId)).toBeTruthy();
        });
    });

    describe('searchItems', () => {
        it('should throw InvalidCategoryException if category does not exist', async () => {
            const searchDto = { title: 'Test' } as SearchAuctionItemsDto;
            fakeCategoryService.isExist = jest
                .fn()
                .mockResolvedValueOnce(false);

            await expect(service.searchItems(searchDto)).rejects.toThrow(
                InvalidCategoryException,
            );
        });

        it('should search items', async () => {
            const mockItems = [{ id: 1, title: 'Test item' }];
            const searchDto = { title: 'Test' } as SearchAuctionItemsDto;
            fakeCategoryService.isExist = jest.fn().mockResolvedValueOnce(true);
            fakeAuctionItemRepo.searchItems = jest
                .fn()
                .mockResolvedValueOnce(mockItems);
            fakeCacheManager.get = jest.fn().mockResolvedValueOnce(null);

            expect(await service.searchItems(searchDto)).toEqual(mockItems);
        });
    });
});
