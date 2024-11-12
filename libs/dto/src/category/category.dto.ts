import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class CategoryDto {
    @ApiProperty({
        description: '4자리 상품 분류 코드',
        example: '0001',
    })
    @Expose()
    c_code: string;

    @ApiProperty({
        description: '상품 분류 코드 이름',
        example: '기본 아이템',
    })
    @Expose()
    c_name: string;
}

export class CategoryListDto {
    @ApiProperty({ description: '전체 개수', example: 5 })
    @Expose()
    total: number;

    @ApiProperty({ description: '카테고리 리스트', type: [CategoryDto] })
    @Expose()
    @Type(() => CategoryDto)
    categories: CategoryDto[];
}
