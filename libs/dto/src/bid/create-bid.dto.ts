import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateBidDto {
    @ApiProperty({ required: true, description: '상품 id', example: 10 })
    @IsNumber()
    @IsNotEmpty()
    item_id: number;

    @ApiProperty({ required: true, description: '입찰 금액', example: 10000 })
    @IsNumber()
    @IsNotEmpty()
    bid_amount: number;
}
