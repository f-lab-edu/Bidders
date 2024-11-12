import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../entities/category.repository';
import { CreateCategoryDto, UpdateCategoryDto } from '@libs/dto';
import {
    CategoryNotFoundException,
    CategoryUpdateFailedException,
    DuplicateCategoryException,
} from '@libs/common';

@Injectable()
export class CategoryService {
    constructor(private readonly categoryRepo: CategoryRepository) {}

    async createCategory(createCategoryDto: CreateCategoryDto) {
        const storedCategory = await this.categoryRepo.findOneByCode(
            createCategoryDto.c_code,
        );
        if (storedCategory) throw new DuplicateCategoryException();

        const category = await this.categoryRepo.create(createCategoryDto);
        return category;
    }

    async getCategory(code: string) {
        const category = await this.categoryRepo.findOneByCode(code);
        if (!category) throw new CategoryNotFoundException();

        return category;
    }

    async getCategories() {
        const categories = await this.categoryRepo.findAll();
        return categories;
    }

    async updateCategory(code: string, updateCategoryDto: UpdateCategoryDto) {
        const category = await this.categoryRepo.findOneByCode(code);
        if (!category) throw new CategoryNotFoundException();

        const toCategory = await this.categoryRepo.findOneByCode(
            updateCategoryDto.c_code,
        );
        if (toCategory) throw new DuplicateCategoryException();

        const updated = await this.categoryRepo.update(
            category,
            updateCategoryDto,
        );
        if (!updated) throw new CategoryUpdateFailedException();

        const updatedCategory = Object.assign(category, updateCategoryDto);
        return updatedCategory;
    }

    async isExist(code: string) {
        const category = await this.categoryRepo.findOneByCode(code);
        if (!category) return false;
        return true;
    }
}
