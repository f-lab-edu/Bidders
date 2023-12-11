import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import {
    CreateAuctionItemDto,
    CreateUserDto,
    SearchAuctionItemsDto,
    UpdateAuctionItemDto,
} from '@libs/dto';

describe('Auction-item e2e', () => {
    let app: INestApplication;
    const signUpDto: CreateUserDto = {
        email: 'auction-e2e-test@bidders.com',
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

    it('/auction/item (POST)', async () => {
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

        return request(app.getHttpServer())
            .post('/auction/item')
            .set('Authorization', `Bearer ${atk}`)
            .send(createAuctionItemDto)
            .expect(201)
            .then((res) => {
                itemId = res.body.id;
                expect(itemId).toBeDefined();
                expect(res.body).toHaveProperty(
                    'c_code',
                    createAuctionItemDto.c_code,
                );
                expect(res.body).toHaveProperty(
                    'title',
                    createAuctionItemDto.title,
                );
            });
    });

    it('/auction/items (GET)', async () => {
        return request(app.getHttpServer())
            .get('/auction/items')
            .expect(200)
            .then((res) => {
                const { total, items } = res.body;

                expect(total).toBeDefined();
                expect(items).toBeDefined();
            });
    });

    it('/auction/item/:itemId (GET)', async () => {
        return request(app.getHttpServer())
            .get(`/auction/item/${itemId}`)
            .expect(200)
            .then((res) => {
                const { id, c_code, title } = res.body;

                expect(id).toBeDefined();
                expect(c_code).toEqual(createAuctionItemDto.c_code);
                expect(title).toEqual(createAuctionItemDto.title);
            });
    });

    it('/auction/item/:itemId (PUT)', async () => {
        const updateItemDto: UpdateAuctionItemDto = {
            c_code: '9999',
            title: 'Test item updated',
            content: 'contents updated',
            image: 'image url',
            start_datetime: new Date('2999-12-24 00:00:00').toISOString(),
            end_datetime: new Date('2999-12-25 00:00:00').toISOString(),
            start_price: 0,
        };

        return request(app.getHttpServer())
            .put(`/auction/item/${itemId}`)
            .set('Authorization', `Bearer ${userAtk}`)
            .send(updateItemDto)
            .expect(200)
            .then((res) => {
                const { title, content } = res.body;

                expect(title).toEqual(updateItemDto.title);
                expect(content).toEqual(updateItemDto.content);
            });
    });

    it('/auction/item/:itemId/status (PATCH)', async () => {
        return request(app.getHttpServer())
            .patch(`/auction/item/${itemId}/status`)
            .expect(200)
            .then((res) => {
                const { status } = res.body;

                expect(status).toEqual(1);
            });
    });

    it('/auction/item/:itemId/likes (PATCH)', async () => {
        return request(app.getHttpServer())
            .patch(`/auction/item/${itemId}/likes`)
            .set('Authorization', `Bearer ${userAtk}`)
            .expect(200)
            .then((res) => {
                const { likes } = res.body;

                expect(likes).toEqual(1);
            });
    });

    it('/auction/items/search (GET)', async () => {
        const searchDto: SearchAuctionItemsDto = {
            c_code: '9999',
        };
        return request(app.getHttpServer())
            .get('/auction/items/search')
            .query(searchDto)
            .expect(200)
            .then((res) => {
                const { total, items } = res.body;

                expect(total).toEqual(1);
                expect(items).toBeDefined();
            });
    });

    it('/auction/item/:itemId (DELETE)', async () => {
        return request(app.getHttpServer())
            .delete(`/auction/item/${itemId}`)
            .set('Authorization', `Bearer ${userAtk}`)
            .expect(200)
            .then((res) => {
                expect(res.text).toEqual('true');
            });
    });
});
