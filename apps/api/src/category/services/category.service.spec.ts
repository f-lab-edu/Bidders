import { Test } from '@nestjs/testing';
import { CategoryRepository } from '../entities/category.repository';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from '@libs/dto';
import {
    CategoryNotFoundException,
    CategoryUpdateFailedException,
    DuplicateCategoryException,
} from '@libs/common';

describe('CategoryService', () => {
    let service: CategoryService;
    let fakeCategoryRepo: Partial<CategoryRepository>;

    const fakeCategory = {
        c_code: '0001',
        c_name: '기본',
    };

    const fakeCategories = {
        total: 1,
        categories: [fakeCategory],
    };

    beforeEach(async () => {
        fakeCategoryRepo = {
            create: jest.fn().mockResolvedValue(fakeCategory),
            findOneByCode: jest.fn().mockResolvedValue(fakeCategory),
            findAll: jest.fn().mockResolvedValue(fakeCategories),
            update: jest.fn().mockResolvedValue(true),
        };

        const module = await Test.createTestingModule({
            providers: [
                CategoryService,
                { provide: CategoryRepository, useValue: fakeCategoryRepo },
            ],
        }).compile();

        service = module.get(CategoryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createCategory', () => {
        it('should throw DuplicateCategoryException if category already exists', async () => {
            const createCategoryDto = new CreateCategoryDto();
            createCategoryDto.c_code = fakeCategory.c_code;
            createCategoryDto.c_name = fakeCategory.c_name;

            await expect(
                service.createCategory(createCategoryDto),
            ).rejects.toThrowError(DuplicateCategoryException);
        });

        it('should create a new category', async () => {
            fakeCategoryRepo.findOneByCode = jest
                .fn()
                .mockResolvedValueOnce(null);
            const createCategoryDto = { c_code: '0002', c_name: '기본2' };
            const category = await service.createCategory(createCategoryDto);

            expect(category.c_code).toBeDefined();
            expect(category.c_name).toBeDefined();
        });
    });

    describe('getCategory', () => {
        it('should throw CategoryNotFoundException if category does not exist', async () => {
            fakeCategoryRepo.findOneByCode = jest
                .fn()
                .mockResolvedValueOnce(null);

            await expect(service.getCategory('0002')).rejects.toThrowError(
                CategoryNotFoundException,
            );
        });

        it('should return a category if it exists', async () => {
            const category = await service.getCategory(fakeCategory.c_code);

            expect(category).toBeDefined();
            expect(category).toEqual(fakeCategory);
        });
    });

    describe('getCategories', () => {
        it('should return an array of categories', async () => {
            const categories = await service.getCategories();

            expect(fakeCategoryRepo.findAll).toBeCalled();
            expect(categories.total).toBeDefined();
            expect(categories.categories).toBeDefined();
        });
    });

    describe('updateCategory', () => {
        it('should throw CategoryNotFoundException if category does not exist', async () => {
            fakeCategoryRepo.findOneByCode = jest
                .fn()
                .mockResolvedValueOnce(null);

            await expect(
                service.updateCategory('0001', {} as UpdateCategoryDto),
            ).rejects.toThrowError(CategoryNotFoundException);
        });

        it('should throw DuplicateCategoryException if updated category code already exists', async () => {
            const updateCategoryDto = new UpdateCategoryDto();
            updateCategoryDto.c_code = '0001';
            updateCategoryDto.c_name = '기본1';

            await expect(
                service.updateCategory('0001', updateCategoryDto),
            ).rejects.toThrowError(DuplicateCategoryException);
        });

        it('should update a category', async () => {
            fakeCategoryRepo.findOneByCode = jest
                .fn()
                .mockResolvedValueOnce(fakeCategory)
                .mockResolvedValueOnce(null);

            const updateCategoryDto = new UpdateCategoryDto();
            updateCategoryDto.c_code = '0002';
            updateCategoryDto.c_name = '기본-1';

            const updatedCategory = await service.updateCategory(
                '0001',
                updateCategoryDto,
            );

            expect(updatedCategory.c_code).toEqual(updateCategoryDto.c_code);
            expect(updatedCategory.c_name).toEqual(updateCategoryDto.c_name);
        });

        it('should throw CategoryUpdateFailedException if update fails', async () => {
            fakeCategoryRepo.findOneByCode = jest
                .fn()
                .mockResolvedValueOnce(fakeCategory)
                .mockResolvedValueOnce(null);
            fakeCategoryRepo.update = jest.fn().mockResolvedValueOnce(false);

            await expect(
                service.updateCategory('0001', {} as UpdateCategoryDto),
            ).rejects.toThrowError(CategoryUpdateFailedException);
        });
    });

    describe('isExist', () => {
        it('should return true if category exists', async () => {
            expect(await service.isExist('0001')).toBe(true);
        });

        it('should return false if category does not exist', async () => {
            fakeCategoryRepo.findOneByCode = jest
                .fn()
                .mockResolvedValueOnce(null);

            expect(await service.isExist('0002')).toBe(false);
        });
    });
});
