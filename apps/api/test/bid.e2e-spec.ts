import {
    CreateAuctionItemDto,
    CreateBidDto,
    CreateUserDto,
    UpdateBidDto,
} from '@libs/dto';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';

describe('Bid e2e', () => {
    let app: INestApplication;
    const signUpDto: CreateUserDto = {
        email: 'bid-e2e-test@bidders.com',
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

    let userAtk: string;
    let itemId: number;
    let bidId: number;

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

    it('/auction/bid (POST)', async () => {
        const signUpResponse = await request(app.getHttpServer())
            .post('/user/signup')
            .send(signUpDto)
            .expect(201);
        const { atk } = signUpResponse.body;
        userAtk = atk;

        await request(app.getHttpServer())
            .post('/category')
            .send(createCategoryDto)
            .expect(201);

        const createItemResponse = await request(app.getHttpServer())
            .post('/auction/item')
            .set('Authorization', `Bearer ${atk}`)
            .send(createAuctionItemDto)
            .expect(201);

        const { id: item_id } = createItemResponse.body;
        itemId = item_id;

        await request(app.getHttpServer())
            .patch(`/auction/item/${itemId}/status`)
            .expect(200);

        const createBidDto: CreateBidDto = {
            item_id,
            bid_amount: 11000,
        };

        return request(app.getHttpServer())
            .post('/auction/bid')
            .set('Authorization', `Bearer ${atk}`)
            .send(createBidDto)
            .expect(201)
            .then((res) => {
                const { id, item_id, bid_amount } = res.body;
                bidId = id;

                expect(id).toBeDefined();
                expect(item_id).toEqual(createBidDto.item_id);
                expect(bid_amount).toEqual(createBidDto.bid_amount);
            });
    });

    it('/auction/bid/:bidId (PATCH)', async () => {
        const updateBidDto: UpdateBidDto = {
            bid_amount: 12000,
        };

        return request(app.getHttpServer())
            .patch(`/auction/bid/${bidId}`)
            .set('Authorization', `Bearer ${userAtk}`)
            .send(updateBidDto)
            .expect(200)
            .then((res) => {
                const { item_id, bid_amount } = res.body;

                expect(item_id).toEqual(itemId);
                expect(bid_amount).toEqual(updateBidDto.bid_amount);
            });
    });
});
