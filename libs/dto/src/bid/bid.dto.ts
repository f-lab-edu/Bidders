import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

const timeOptions = {
    timeZone: 'Asia/Seoul',
    hour12: false,
};

export class BidDto {
    @ApiProperty({ description: '상품 id', example: 10 })
    @Expose()
    item_id: number;

    @ApiProperty({ description: '사용자 id', example: 'qwer-asdf-zcxv' })
    @Expose()
    user_id: string;

    @ApiProperty({ description: '입찰 금액', example: 10000 })
    @Expose()
    bid_amount: number;

    @ApiProperty({
        description: '입찰 시간',
        example: '2023-12-15T13:00:00.000Z',
    })
    @Expose()
    @Transform(({ value }) => value.toLocaleString('en-US', timeOptions))
    created_at: Date;
}
