import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { CategoryService } from '../services/category.service';
import {
    CategoryDto,
    CategoryListDto,
    CreateCategoryDto,
    UpdateCategoryDto,
} from '@libs/dto';
import { SerializeInterceptor } from '@libs/common';

@ApiTags('Category')
@Controller()
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @ApiOperation({ summary: '카테고리 등록' })
    @ApiCreatedResponse({
        description: '카테고리 등록 완료',
        type: CategoryDto,
    })
    @UseInterceptors(new SerializeInterceptor(CategoryDto))
    @Post('category')
    async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
        return await this.categoryService.createCategory(createCategoryDto);
    }

    @ApiOperation({ summary: '카테고리 리스트' })
    @ApiOkResponse({ description: '카테고리 리스트', type: CategoryListDto })
    @UseInterceptors(new SerializeInterceptor(CategoryListDto))
    @Get('categories')
    async getCategories() {
        return this.categoryService.getCategories();
    }

    @ApiOperation({ summary: '카테고리 조회' })
    @ApiOkResponse({ description: '카테고리 정보 조회', type: CategoryDto })
    @ApiParam({
        required: true,
        name: 'code',
        description: '카테고리 code',
    })
    @UseInterceptors(new SerializeInterceptor(CategoryDto))
    @Get('category/:code')
    async category(@Param('code') code: string) {
        return await this.categoryService.getCategory(code);
    }

    @ApiOperation({ summary: '카테고리 수정' })
    @ApiOkResponse({ description: '카테고리 수정 성공', type: CategoryDto })
    @ApiParam({
        required: true,
        name: 'code',
        description: '카테고리 code',
    })
    @UseInterceptors(new SerializeInterceptor(CategoryDto))
    @Put('category/:code')
    async updateCategory(
        @Param('code') code: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ) {
        return await this.categoryService.updateCategory(
            code,
            updateCategoryDto,
        );
    }
}
