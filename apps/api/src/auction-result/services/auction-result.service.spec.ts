import { Test } from '@nestjs/testing';
import { AuctionResultService } from './auction-result.service';
import { AuctionResultRepository } from '../entities/auction-result.repository';
import { AuctionItemService } from '../../auction-item/services/auction-item.service';
import { BidService } from '../../bid/services/bid.service';
import {
    InvalidAuctionResultException,
    ItemNotFoundException,
    ItemStatusInvalidException,
} from '@libs/common';
import { AuctionResultDto, CreateAuctionResultDto } from '@libs/dto';
import { AuctionItem } from '../../auction-item/entities/auction-item.entity';

describe('AuctionResultService', () => {
    let service: AuctionResultService;
    let fakeAuctionResultRepo: Partial<AuctionResultRepository>;
    let fakeAuctionItemService: Partial<AuctionItemService>;
    let fakeBidService: Partial<BidService>;
    const createAuctionResultDto: CreateAuctionResultDto = {
        item_id: 10,
        winning_bid_id: 1,
    };

    beforeEach(async () => {
        fakeAuctionResultRepo = {
            create: jest.fn(),
        };
        fakeAuctionItemService = {
            getItem: jest.fn(),
        };
        fakeBidService = {
            getBid: jest.fn(),
        };

        const module = await Test.createTestingModule({
            providers: [
                AuctionResultService,
                {
                    provide: AuctionResultRepository,
                    useValue: fakeAuctionResultRepo,
                },
                {
                    provide: AuctionItemService,
                    useValue: fakeAuctionItemService,
                },
                {
                    provide: BidService,
                    useValue: fakeBidService,
                },
            ],
        }).compile();

        service = module.get(AuctionResultService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createAuctionResult', () => {
        it('should throw ItemNotFoundException if item does not exist', async () => {
            fakeAuctionItemService.getItem = jest
                .fn()
                .mockResolvedValueOnce(null);

            await expect(
                service.createAuctionResult(createAuctionResultDto),
            ).rejects.toThrow(ItemNotFoundException);
        });

        it('should throw InvalidAuctionResultException if bid item_id does not match', async () => {
            fakeAuctionItemService.getItem = jest
                .fn()
                .mockResolvedValueOnce({ status: 2 } as AuctionItem);
            fakeBidService.getBid = jest
                .fn()
                .mockResolvedValueOnce({ item_id: 11 });

            await expect(
                service.createAuctionResult(createAuctionResultDto),
            ).rejects.toThrow(InvalidAuctionResultException);
        });

        it('should throw ItemStatusInvalidException if item status is invalid', async () => {
            fakeAuctionItemService.getItem = jest
                .fn()
                .mockResolvedValueOnce({ status: 1 } as AuctionItem);
            fakeBidService.getBid = jest
                .fn()
                .mockResolvedValueOnce({ item_id: 11 });

            await expect(
                service.createAuctionResult(createAuctionResultDto),
            ).rejects.toThrow(ItemStatusInvalidException);
        });

        it('should create an auction result', async () => {
            fakeAuctionItemService.getItem = jest
                .fn()
                .mockResolvedValueOnce(true);
            fakeBidService.getBid = jest
                .fn()
                .mockResolvedValueOnce({ item_id: 10 });
            fakeAuctionItemService.getItem = jest
                .fn()
                .mockResolvedValueOnce({ status: 2 } as AuctionItem);

            fakeAuctionResultRepo.create = jest.fn().mockResolvedValueOnce({
                item_id: 10,
                winning_bid_id: 1,
            } as AuctionResultDto);
            const auctionResult = await service.createAuctionResult(
                createAuctionResultDto,
            );

            expect(auctionResult).toBeDefined();
            expect(auctionResult.item_id).toEqual(
                createAuctionResultDto.item_id,
            );
            expect(auctionResult.winning_bid_id).toEqual(
                createAuctionResultDto.winning_bid_id,
            );
        });
    });
});
