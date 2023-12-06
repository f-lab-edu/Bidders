import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({
        required: true,
        description: '4자리 상품 분류 코드',
        example: '0001',
    })
    @Length(4, 4)
    @IsString()
    @IsNotEmpty()
    c_code: string;

    @ApiProperty({
        required: true,
        description: '상품 분류 코드 이름',
        example: '기본 아이템',
    })
    @MaxLength(50)
    @IsString()
    @IsNotEmpty()
    c_name: string;
}
