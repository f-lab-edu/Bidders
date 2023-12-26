import { ApiProperty } from '@nestjs/swagger';
import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class UpdateAuctionItemDto {
    @ApiProperty({
        required: true,
        description: '카테고리 code',
        example: '0001',
    })
    @IsString()
    @IsNotEmpty()
    c_code: string;

    @ApiProperty({
        required: true,
        description: '상품 제목',
        example: '경매 등록 상품 제목',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        required: true,
        description: '상품 내용',
        example: '상품 내용 상세',
    })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({
        required: false,
        description: '상품 이미지 url',
        example: 'https://auction-item.image.url',
    })
    @IsString()
    @IsOptional()
    image: string;

    @ApiProperty({
        required: true,
        description: '경매 시작일시',
        example: '2023-12-12 15:00:00',
    })
    @IsDateString()
    @IsNotEmpty()
    start_datetime: string;

    @ApiProperty({
        required: true,
        description: '경매 종료일시',
        example: '2023-12-15 22:00:00',
    })
    @IsDateString()
    @IsNotEmpty()
    end_datetime: string;

    @ApiProperty({
        required: true,
        description: '시작 가격',
        example: '10000',
    })
    @IsNumber()
    @IsNotEmpty()
    start_price: number;
}
