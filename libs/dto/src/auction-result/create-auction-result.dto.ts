import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateAuctionResultDto {
    @ApiProperty({ required: true, description: '상품 id', example: 10 })
    @IsNumber()
    @IsNotEmpty()
    item_id: number;

    @ApiProperty({ required: true, description: '입찰 id', example: 1 })
    @IsNumber()
    @IsNotEmpty()
    winning_bid_id: number;
}
