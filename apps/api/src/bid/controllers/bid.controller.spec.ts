import { Test } from '@nestjs/testing';
import { BidService } from '../services/bid.service';
import { BidController } from './bid.controller';
import { IUserPayload, JwtService } from '@libs/util/jwt';
import { BidDto, CreateBidDto, UpdateBidDto } from '@libs/dto';

describe('BidController', () => {
    let controller: BidController;
    let fakeBidService: Partial<BidService>;
    let fakeJwtService: Partial<JwtService>;
    const createBidDto: CreateBidDto = {
        item_id: 10,
        bid_amount: 10000,
    };
    const bidDto: BidDto = {
        id: 1,
        item_id: 10,
        user_id: 'qwer-asdf-zxcv',
        bid_amount: 10000,
        created_at: new Date(),
    };

    beforeEach(async () => {
        fakeBidService = {
            placeBid: jest.fn(),
            updateBid: jest.fn(),
        };

        fakeJwtService = {
            verify: jest.fn(),
        };

        const module = await Test.createTestingModule({
            controllers: [BidController],
            providers: [
                { provide: BidService, useValue: fakeBidService },
                { provide: JwtService, useValue: fakeJwtService },
            ],
        }).compile();

        controller = module.get(BidController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('postBid', () => {
        it('should create a bid', async () => {
            const user: IUserPayload = {
                id: 'qwer-asdf-zxcv',
                email: 'test@bidders.com',
            };
            fakeBidService.placeBid = jest.fn().mockResolvedValueOnce(bidDto);

            expect(await controller.postBid(user, createBidDto)).toBeDefined();
        });
    });

    describe('patchBid', () => {
        it('should update bid', async () => {
            const user: IUserPayload = {
                id: 'qwer-asdf-zxcv',
                email: 'test@bidders.com',
            };
            const bidId = 1;
            const updateBidDto = { bid_amount: 15000 } as UpdateBidDto;
            fakeBidService.updateBid = jest
                .fn()
                .mockResolvedValueOnce({ ...bidDto, ...updateBidDto });

            const updatedBid = await controller.patchBid(
                bidId,
                user,
                updateBidDto,
            );

            expect(updatedBid.bid_amount).toEqual(updateBidDto.bid_amount);
        });
    });
});
