import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AuctionResultDto {
    @ApiProperty({ description: '상품 id', example: 10 })
    @Expose()
    item_id: number;

    @ApiProperty({ description: '입찰 id', example: 1 })
    @Expose()
    winning_bid_id: number;

    @ApiProperty({ description: '낙찰 금액', example: 20000 })
    @Expose()
    final_price: number;
}
