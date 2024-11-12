import { Test } from '@nestjs/testing';
import { CategoryService } from '../services/category.service';
import { CategoryController } from './category.controller';
import { CreateCategoryDto, UpdateCategoryDto } from '@libs/dto';

describe('CategoryController', () => {
    let controller: CategoryController;
    let fakeCategoryService: Partial<CategoryService>;

    const fakeCategory = {
        c_code: '0001',
        c_name: '기본',
    };

    const fakeCategories = {
        total: 1,
        categories: [fakeCategory],
    };

    beforeEach(async () => {
        fakeCategoryService = {
            createCategory: jest.fn(),
            getCategory: jest.fn(),
            getCategories: jest.fn(),
            updateCategory: jest.fn(),
        };

        const module = await Test.createTestingModule({
            controllers: [CategoryController],
            providers: [
                { provide: CategoryService, useValue: fakeCategoryService },
            ],
        }).compile();

        controller = module.get(CategoryController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('postCategory', () => {
        it('should create a category', async () => {
            fakeCategoryService.createCategory = jest
                .fn()
                .mockResolvedValueOnce(fakeCategory);

            const dto = new CreateCategoryDto();

            expect(await controller.postCategory(dto)).toBe(fakeCategory);
            expect(fakeCategoryService.createCategory).toBeCalled();
        });
    });

    describe('getCategories', () => {
        it('should get categories', async () => {
            fakeCategoryService.getCategories = jest
                .fn()
                .mockResolvedValueOnce(fakeCategories);

            expect(await controller.getCategories()).toBeDefined();
            expect(fakeCategoryService.getCategories).toBeCalled();
        });
    });

    describe('getCategory', () => {
        it('should get a category by code', async () => {
            fakeCategoryService.getCategory = jest
                .fn()
                .mockResolvedValueOnce(fakeCategory);
            const code = '0001';

            expect(await controller.getCategory(code)).toBe(fakeCategory);
            expect(fakeCategoryService.getCategory).toBeCalled();
        });
    });

    describe('putCategory', () => {
        it('should update a category', async () => {
            fakeCategoryService.updateCategory = jest
                .fn()
                .mockResolvedValueOnce(fakeCategory);
            const code = '0001';
            const dto = new UpdateCategoryDto();

            expect(await controller.putCategory(code, dto)).toBe(fakeCategory);
            expect(fakeCategoryService.updateCategory).toBeCalled();
        });
    });
});
