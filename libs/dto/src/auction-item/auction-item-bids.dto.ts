import { ApiProperty } from '@nestjs/swagger';
import { AuctionItemDto } from './auction-item.dto';
import { Expose, Type } from 'class-transformer';
import { BidDto } from '../bid';

export class AuctionItemBidsDto extends AuctionItemDto {
    @ApiProperty({ description: '입찰 정보 리스트', type: BidDto })
    @Expose()
    @Type(() => BidDto)
    bids: BidDto[];
}
