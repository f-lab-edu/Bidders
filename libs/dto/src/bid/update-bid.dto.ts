import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateBidDto {
    @ApiProperty({ required: true, description: '입찰 금액', example: 10000 })
    @IsNumber()
    @IsNotEmpty()
    bid_amount: number;
}
