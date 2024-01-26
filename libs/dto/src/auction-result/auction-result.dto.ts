import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AuctionResultDto {
    @ApiProperty({ description: '상품 id', example: 10 })
    @Expose()
    item_id: number;

    @ApiProperty({ description: '사용자 id', example: 1 })
    @Expose()
    user_id: string;

    @ApiProperty({ description: '낙찰 금액', example: 20000 })
    @Expose()
    final_price: number;
}
