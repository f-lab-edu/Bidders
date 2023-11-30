import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';

describe('Authentication System', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('handles a sign up request', () => {
        const email = uuidv4();
        const signUpDto = {
            email: `${email}@bidders.com`,
            password: 'mypassword',
            username: 'test-user',
        };

        return request(app.getHttpServer())
            .post('/user/signup')
            .send(signUpDto)
            .expect(201)
            .then((res) => {
                const { atk, rtk } = res.body;
                expect(atk).toBeDefined();
                expect(rtk).toBeDefined();
            });
    });

    it('sign up as a new user and get user with token', async () => {
        const email = uuidv4();
        const signUpDto = {
            email: `${email}@bidders.com`,
            password: 'mypassword',
            username: 'test-user',
        };

        const res = await request(app.getHttpServer())
            .post('/user/signup')
            .send(signUpDto)
            .expect(201);

        const { atk } = res.body;
        const { body } = await request(app.getHttpServer())
            .get('/user/me')
            .set('Authorization', `Bearer ${atk}`)
            .expect(200);

        expect(body.email).toEqual(`${email}@bidders.com`);
        expect(body.username).toEqual(signUpDto.username);
    });
});
