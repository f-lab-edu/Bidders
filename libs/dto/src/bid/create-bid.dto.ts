import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateBidDto {
    @ApiProperty({ required: true, description: '상품 id', example: 10 })
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    item_id: number;

    @ApiProperty({ required: true, description: '입찰 금액', example: 10000 })
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    bid_amount: number;
}
