import { Test } from '@nestjs/testing';
import { AuctionItemService } from '../services/auction-item.service';
import { AuctionItemController } from './auction-item.controller';
import { IUserPayload, JwtService } from '@libs/util/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
    AuctionItemBidsDto,
    AuctionItemDto,
    AuctionItemListDto,
    CreateAuctionItemDto,
    SearchAuctionItemsDto,
    UpdateAuctionItemDto,
} from '@libs/dto';

describe('AuctionItemController', () => {
    let controller: AuctionItemController;
    let fakeAuctionItemService: Partial<AuctionItemService>;
    let fakeJwtService: Partial<JwtService>;
    let fakeCacheManager: Partial<Cache>;

    beforeEach(async () => {
        fakeAuctionItemService = {
            createItem: jest.fn(),
            getItems: jest.fn(),
            getItemWithBids: jest.fn(),
            updateItem: jest.fn(),
            updateStatus: jest.fn(),
            updateLikes: jest.fn(),
            deleteItem: jest.fn(),
            searchItems: jest.fn(),
        };

        fakeJwtService = {
            verify: jest.fn(),
        };

        fakeCacheManager = {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
        };

        const module = await Test.createTestingModule({
            controllers: [AuctionItemController],
            providers: [
                {
                    provide: AuctionItemService,
                    useValue: fakeAuctionItemService,
                },
                {
                    provide: JwtService,
                    useValue: fakeJwtService,
                },
                {
                    provide: CACHE_MANAGER,
                    useValue: fakeCacheManager,
                },
            ],
        }).compile();

        controller = module.get(AuctionItemController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createItem', () => {
        it('should create an auction item', async () => {
            const mockUser: IUserPayload = {
                id: 'qwer-asdf-zxcv',
                email: 'test@bidders.com',
            };
            const mockCreateDto: CreateAuctionItemDto = {
                c_code: '0001',
                title: 'Test auction item',
                content: 'contents',
                image: 'image url',
                start_datetime: new Date('2999-12-24 00:00:00').toISOString(),
                end_datetime: new Date('2999-12-25 00:00:00').toISOString(),
                start_price: 10000,
            };
            const mockDto: AuctionItemDto = {
                id: 1,
                c_code: '0001',
                title: 'Test auction item',
                content: 'contents',
                image: 'image url',
                user_id: 'qwer-asdf-zxcv',
                status: 0,
                likes: 0,
                start_datetime: new Date('2999-12-24 00:00:00'),
                end_datetime: new Date('2999-12-25 00:00:00'),
                start_price: 10000,
                created_at: new Date(),
            };
            fakeAuctionItemService.createItem = jest
                .fn()
                .mockResolvedValueOnce(mockDto);

            expect(
                await controller.createItem(mockUser, mockCreateDto),
            ).toEqual(mockDto);
            expect(fakeAuctionItemService.createItem).toBeCalled();
        });
    });

    describe('getItems', () => {
        it('should return a list of auction items', async () => {
            const mockItems = [
                {
                    total: 1,
                    items: [{ title: 'Test item' } as AuctionItemDto],
                } as AuctionItemListDto,
            ];
            fakeAuctionItemService.getItems = jest
                .fn()
                .mockResolvedValueOnce(mockItems);

            expect(await controller.getItems()).toEqual(mockItems);
        });
    });

    describe('itemWithBids', () => {
        it('should return an auction item with bids', async () => {
            const mockItemId = 1;
            const mockItemWithBids = {
                title: 'Test item',
                bids: [],
            } as AuctionItemBidsDto;
            fakeAuctionItemService.getItemWithBids = jest
                .fn()
                .mockResolvedValueOnce(mockItemWithBids);

            expect(await controller.itemWithBids(mockItemId)).toEqual(
                mockItemWithBids,
            );
        });
    });

    describe('updateMyItem', () => {
        it('should update an auction item', async () => {
            const mockItemId = 1;
            const mockUser: IUserPayload = {
                id: 'qwer-asdf-zxcv',
                email: 'test@bidders.com',
            };
            const mockUpdateDto = {
                title: 'Update test item',
            } as UpdateAuctionItemDto;
            const updatedItem = {
                id: mockItemId,
                ...mockUpdateDto,
            };
            fakeAuctionItemService.updateItem = jest
                .fn()
                .mockResolvedValueOnce(updatedItem);

            expect(
                await controller.updateMyItem(
                    mockItemId,
                    mockUser,
                    mockUpdateDto,
                ),
            ).toEqual(updatedItem);
        });
    });

    describe('patchStatus', () => {
        it('should update the status of an auction item', async () => {
            const mockItemId = 1;
            const updatedItemStatus = {
                id: mockItemId,
                status: 1,
            } as AuctionItemDto;
            fakeAuctionItemService.updateStatus = jest
                .fn()
                .mockResolvedValueOnce(updatedItemStatus);

            expect(await controller.patchStatus(mockItemId)).toEqual(
                updatedItemStatus,
            );
        });
    });

    describe('patchLikes', () => {
        it('should update the likes count of an auction item', async () => {
            const mockItemId = 1;
            const updatedItemLikes = {
                id: mockItemId,
                likes: 1,
            } as AuctionItemDto;
            fakeAuctionItemService.updateLikes = jest
                .fn()
                .mockResolvedValueOnce(updatedItemLikes);

            expect(await controller.patchLikes(mockItemId)).toEqual(
                updatedItemLikes,
            );
        });
    });

    describe('deleteItem', () => {
        it('should delete an auction item', async () => {
            const mockItemId = 1;
            const mockUser: IUserPayload = {
                id: 'qwer-asdf-zxcv',
                email: 'test@bidders.com',
            };
            fakeAuctionItemService.deleteItem = jest
                .fn()
                .mockResolvedValueOnce(true);

            expect(await controller.deleteItem(mockItemId, mockUser)).toBe(
                true,
            );
        });
    });

    describe('search', () => {
        it('should return a list of auction items based on search criteria', async () => {
            const mockSearchDto = { c_code: '0001' } as SearchAuctionItemsDto;
            const mockItems = {
                total: 1,
                items: [
                    { c_code: '0001', title: 'Test item' } as AuctionItemDto,
                ],
            } as AuctionItemListDto;
            fakeAuctionItemService.searchItems = jest
                .fn()
                .mockResolvedValueOnce(mockItems);

            expect(await controller.search(mockSearchDto)).toEqual(mockItems);
        });
    });
});
