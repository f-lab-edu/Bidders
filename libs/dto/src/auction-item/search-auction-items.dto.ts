import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class SearchAuctionItemsDto {
    @ApiPropertyOptional({
        required: false,
        description: '분류 코드',
        example: '0001',
    })
    @IsOptional()
    c_code?: string;

    @ApiPropertyOptional({ required: false, description: '상태', example: '1' })
    @IsOptional()
    status?: string;

    @ApiPropertyOptional({
        required: false,
        description: '최소 경매 시작금액',
        example: 10000,
    })
    @Type(() => Number)
    @IsOptional()
    minPrice?: number;

    @ApiPropertyOptional({
        required: false,
        description: '최대 경매 시작금액',
        example: 20000,
    })
    @Type(() => Number)
    @IsOptional()
    maxPrice?: number;
}
