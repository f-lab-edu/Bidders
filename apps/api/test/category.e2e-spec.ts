import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { AppDataSource } from '@libs/database';
import { Category } from '../src/category/entities/category.entity';

describe('Category e2e', () => {
    let app: INestApplication;
    const createCategoryDto = { c_code: 'TEST', c_name: '테스트 코드' };
    const updateCategoryDto = { c_code: 'TEVT', c_name: '테브트 코드' };

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await AppDataSource.initialize();
        const categoryRepo = AppDataSource.getRepository(Category);
        const testCategoryEntity = categoryRepo.create(createCategoryDto);
        const testCategoryEntity2 = categoryRepo.create(updateCategoryDto);

        await categoryRepo.remove(testCategoryEntity);
        await categoryRepo.remove(testCategoryEntity2);
        await AppDataSource.destroy();

        await app.close();
    });

    it('/category (POST)', async () => {
        return request(app.getHttpServer())
            .post('/category')
            .send(createCategoryDto)
            .expect(201)
            .then((res) => {
                expect(res.body).toHaveProperty('c_code', 'TEST');
                expect(res.body).toHaveProperty('c_name', '테스트 코드');
            });
    });

    it('/categories (GET)', async () => {
        return request(app.getHttpServer())
            .get('/categories')
            .expect(200)
            .then((res) => {
                const { total, categories } = res.body;
                expect(total).toBeDefined();
                expect(categories).toBeDefined;
                expect(categories).toBeInstanceOf(Array);
            });
    });

    it('/category/:code (GET)', async () => {
        return request(app.getHttpServer())
            .get('/category/TEST')
            .expect(200)
            .then((res) => {
                expect(res.body).toHaveProperty('c_code', 'TEST');
                expect(res.body).toHaveProperty('c_name', '테스트 코드');
            });
    });

    it('/category/:code (PUT)', async () => {
        return request(app.getHttpServer())
            .put('/category/TEST')
            .send(updateCategoryDto)
            .expect(200)
            .then((res) => {
                expect(res.body).toHaveProperty(
                    'c_code',
                    updateCategoryDto.c_code,
                );
                expect(res.body).toHaveProperty(
                    'c_name',
                    updateCategoryDto.c_name,
                );
            });
    });
});
