import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryColumn,
} from 'typeorm';
import { AuctionItem } from '../../auction-item/entities/auction-item.entity';

@Entity({ name: 'Auction_results' })
export class AuctionResult extends BaseEntity {
    @PrimaryColumn({ type: 'int', comment: '경매 상품 idx' })
    item_id: number;

    @OneToOne(() => AuctionItem, (auctionItem) => auctionItem.auction_result, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'item_id' })
    auction_item: AuctionItem;

    @PrimaryColumn({ type: 'uuid', length: 36, comment: '사용자 id' })
    user_id: string;

    @Column({ type: 'int', nullable: false, comment: '낙찰 금액' })
    final_price: number;
}
