import { Test } from '@nestjs/testing';
import { BidService } from './bid.service';
import { AuctionItemService } from '../../auction-item/services/auction-item.service';
import { BidRepository } from '../entities/bid.repository';
import { BidDto, CreateBidDto, UpdateBidDto } from '@libs/dto';
import {
    BidAccessNotAllowedException,
    BidCreationNotAllowedException,
    BidNotFoundException,
    ItemNotFoundException,
} from '@libs/common';
import { Bid } from '../entities/bid.entity';

describe('BidService', () => {
    let service: BidService;
    let fakeAuctionItemService: Partial<AuctionItemService>;
    let fakeBidRepo: Partial<BidRepository>;
    const createBidDto: CreateBidDto = {
        item_id: 10,
        bid_amount: 10000,
    };
    const mockBid = {
        id: 1,
        item_id: 10,
        user_id: 'qwer-asdf-zxcv',
        bid_amount: 10000,
    } as BidDto;

    beforeEach(async () => {
        fakeBidRepo = {
            create: jest.fn(),
            findOne: jest.fn(),
            findOneByUserId: jest.fn(),
            update: jest.fn(),
        };

        fakeAuctionItemService = {
            isExist: jest.fn(),
            deleteSingleItemCache: jest.fn(),
        };

        const module = await Test.createTestingModule({
            providers: [
                BidService,
                {
                    provide: AuctionItemService,
                    useValue: fakeAuctionItemService,
                },
                { provide: BidRepository, useValue: fakeBidRepo },
            ],
        }).compile();

        service = module.get(BidService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('placeBid', () => {
        it('should throw ItemNotFoundException if item does not exist', async () => {
            fakeAuctionItemService.isExist = jest
                .fn()
                .mockResolvedValueOnce(false);
            await expect(
                service.placeBid('qwer-asdf-zxcv', createBidDto),
            ).rejects.toThrow(ItemNotFoundException);
        });

        it('should throw BidCreationNotAllowedException if bidding history exists', async () => {
            fakeAuctionItemService.isExist = jest
                .fn()
                .mockResolvedValueOnce(true);
            fakeBidRepo.findOneByUserId = jest
                .fn()
                .mockResolvedValueOnce({} as Bid);
            await expect(
                service.placeBid('qewr-asdf-zxcv', createBidDto),
            ).rejects.toThrow(BidCreationNotAllowedException);
        });

        it('should create a bid', async () => {
            fakeAuctionItemService.isExist = jest
                .fn()
                .mockResolvedValueOnce(true);
            fakeBidRepo.findOneByUserId = jest.fn().mockResolvedValueOnce(null);
            fakeBidRepo.create = jest.fn().mockResolvedValueOnce(mockBid);

            expect(
                await service.placeBid('qwer-asdf-zxcv', createBidDto),
            ).toEqual(mockBid);
        });
    });

    describe('updateBid', () => {
        it('should throw BidNotFoundException if bid not found', async () => {
            fakeBidRepo.findOne = jest.fn().mockResolvedValueOnce(null);
            await expect(
                service.updateBid(1, 'qwer-asdf-zxcv', {
                    bid_amount: 15000,
                } as UpdateBidDto),
            ).rejects.toThrow(BidNotFoundException);
        });

        it('should throw BidAccessNotAllowedException if bid belongs to another user', async () => {
            fakeBidRepo.findOne = jest.fn().mockResolvedValueOnce({
                id: 1,
                user_id: 'zcxv-asdf-qwer',
            });
            await expect(
                service.updateBid(1, 'qwer-asdf-zxcv', {
                    bid_amount: 15000,
                } as UpdateBidDto),
            ).rejects.toThrow(BidAccessNotAllowedException);
        });

        it('should update a bid', async () => {
            fakeBidRepo.findOne = jest.fn().mockResolvedValueOnce(mockBid);
            fakeBidRepo.update = jest
                .fn()
                .mockResolvedValueOnce({ bid_amount: 15000 } as Bid);

            const result = await service.updateBid(1, 'qwer-asdf-zxcv', {
                bid_amount: 15000,
            });

            expect(result.bid_amount).toEqual(15000);
        });
    });

    describe('getBid', () => {
        it('should throw BidNotFoundException if bid not found', async () => {
            fakeBidRepo.findOne = jest.fn().mockResolvedValueOnce(null);
            await expect(service.getBid(1)).rejects.toThrow(
                BidNotFoundException,
            );
        });

        it('should get a bid', async () => {
            fakeBidRepo.findOne = jest.fn().mockResolvedValueOnce(mockBid);
            expect(await service.getBid(1)).toBeDefined();
        });
    });
});
