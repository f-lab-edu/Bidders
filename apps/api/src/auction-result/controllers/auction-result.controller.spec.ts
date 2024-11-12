import { Test } from '@nestjs/testing';
import { AuctionResultService } from '../services/auction-result.service';
import { AuctionResultController } from './auction-result.controller';
import { AuctionResultDto, CreateAuctionResultDto } from '@libs/dto';

describe('AuctionResultController', () => {
    let controller: AuctionResultController;
    let fakeAuctionResultService: Partial<AuctionResultService>;

    beforeEach(async () => {
        fakeAuctionResultService = {
            createAuctionResult: jest.fn(),
        };

        const module = await Test.createTestingModule({
            controllers: [AuctionResultController],
            providers: [
                {
                    provide: AuctionResultService,
                    useValue: fakeAuctionResultService,
                },
            ],
        }).compile();

        controller = module.get(AuctionResultController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createResult', () => {
        it('should create an auction result', async () => {
            const createDto: CreateAuctionResultDto = {
                item_id: 10,
                winning_bid_id: 1,
            };
            fakeAuctionResultService.createAuctionResult = jest
                .fn()
                .mockResolvedValueOnce({
                    item_id: 10,
                    winning_bid_id: 1,
                } as AuctionResultDto);

            const result = await controller.createResult(createDto);
            expect(result.item_id).toEqual(10);
            expect(result.winning_bid_id).toEqual(1);
        });
    });
});
