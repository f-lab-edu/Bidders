import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from '@libs/dto';

@Injectable()
export class CategoryRepository {
    constructor(
        @InjectRepository(Category) private readonly repo: Repository<Category>,
    ) {}

    async create(createCategoryDto: CreateCategoryDto) {
        const category = this.repo.create(createCategoryDto);
        return await this.repo.save(category);
    }

    async findOneByCode(code: string) {
        const category = await this.repo.findOneBy({ c_code: code });
        return category;
    }

    async findAll() {
        const categoryArr = await this.repo.findAndCount({
            order: { c_code: 'ASC' },
        });
        return { total: categoryArr[1], categories: categoryArr[0] };
    }

    async update(category: Category, updateCategoryDto: UpdateCategoryDto) {
        const result = await this.repo.update(
            { c_code: category.c_code },
            { ...updateCategoryDto },
        );
        if (!result.affected) return false;
        return true;
    }
}
