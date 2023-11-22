import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryColumn,
} from 'typeorm';
import { AuctionItem } from '../auction-item';
import { Bid } from '../bid';

@Entity({ name: 'Auction_results' })
export class AuctionResult extends BaseEntity {
    @PrimaryColumn({ type: 'int', comment: '경매 상품 idx' })
    item_id: number;

    @OneToOne(() => AuctionItem, (auctionItem) => auctionItem.auction_result, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'item_id' })
    auction_item: AuctionItem;

    @PrimaryColumn({ type: 'int', comment: '낙찰된 입찰 idx' })
    winning_bid_id: number;

    @OneToOne(() => Bid, (bid) => bid.auction_result, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'winning_bid_id' })
    bid: Bid;

    @Column({ type: 'int', nullable: false, comment: '낙찰 금액' })
    final_price: number;
}
