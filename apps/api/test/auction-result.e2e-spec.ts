import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import {
    CreateAuctionItemDto,
    CreateAuctionResultDto,
    CreateBidDto,
    CreateUserDto,
} from '@libs/dto';

describe('AuctionResult e2e', () => {
    let app: INestApplication;
    const signUpDto: CreateUserDto = {
        email: 'auction-result-e2e-test@bidders.com',
        password: 'mypassword',
        username: 'bidders',
    };
    const createCategoryDto = { c_code: '9999', c_name: '테스트 코드' };
    const createAuctionItemDto: CreateAuctionItemDto = {
        c_code: '9999',
        title: 'Test item',
        content: 'contents',
        image: 'image url',
        start_datetime: new Date('2999-12-24 00:00:00').toISOString(),
        end_datetime: new Date('2999-12-25 00:00:00').toISOString(),
        start_price: 10000,
    };

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/auction/result (POST)', () => {
        it('should create an auction result', async () => {
            const signUpResponse = await request(app.getHttpServer())
                .post('/user/signup')
                .send(signUpDto)
                .expect(201);
            const { atk } = signUpResponse.body;

            await request(app.getHttpServer())
                .post('/category')
                .send(createCategoryDto)
                .expect(201);

            const createItemResponse = await request(app.getHttpServer())
                .post('/auction/item')
                .set('Authorization', `Bearer ${atk}`)
                .send(createAuctionItemDto)
                .expect(201);

            const createBidDto: CreateBidDto = {
                item_id: createItemResponse.body.id,
                bid_amount: 11000,
            };

            const createBidResponse = await request(app.getHttpServer())
                .post('/auction/bid')
                .set('Authorization', `Bearer ${atk}`)
                .send(createBidDto)
                .expect(201);

            const createAuctionResultDto: CreateAuctionResultDto = {
                item_id: createItemResponse.body.id,
                winning_bid_id: createBidResponse.body.id,
            };

            return request(app.getHttpServer())
                .post('/auction/result')
                .send(createAuctionResultDto)
                .expect(201)
                .then((res) => {
                    expect(res.body).toHaveProperty('item_id');
                    expect(res.body).toHaveProperty('winning_bid_id');
                    expect(res.body.item_id).toEqual(
                        createAuctionResultDto.item_id,
                    );
                    expect(res.body.winning_bid_id).toEqual(
                        createAuctionResultDto.winning_bid_id,
                    );
                });
        });
    });
});
