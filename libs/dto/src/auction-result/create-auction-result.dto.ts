import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateAuctionResultDto {
    @ApiProperty({ required: true, description: '상품 id', example: 10 })
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    item_id: number;

    @ApiProperty({ required: true, description: '입찰 id', example: 1 })
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    winning_bid_id: number;
}
