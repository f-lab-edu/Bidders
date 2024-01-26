import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
} from 'typeorm';
import { AuctionItem } from '../../auction-item/entities/auction-item.entity';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'Bids' })
export class Bid extends BaseEntity {
    @PrimaryColumn({ type: 'int', comment: '경매 상품 idx' })
    item_id: number;

    @ManyToOne(() => AuctionItem, (auctionItem) => auctionItem.bids, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'item_id' })
    auction_item: AuctionItem;

    @PrimaryColumn({ type: 'uuid', length: 36, comment: '사용자 id' })
    user_id: string;

    @ManyToOne(() => User, (user) => user.bids, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Index()
    @Column({ type: 'int', nullable: false, comment: '입찰 금액' })
    bid_amount: number;

    @CreateDateColumn({ type: 'datetime' })
    created_at: Date;
}
