import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { AuctionItem } from '../auction-item';
import { User } from '../user';
import { AuctionResult } from '../auction-result';

@Entity({ name: 'Bids' })
export class Bid extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @OneToOne(() => AuctionResult, (auctionResult) => auctionResult.bid)
    auction_result: AuctionResult;

    @Column({ type: 'int', nullable: false, comment: '경매 상품 idx' })
    item_id: number;

    @ManyToOne(() => AuctionItem, (auctionItem) => auctionItem.bids, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'item_id' })
    auction_item: AuctionItem;

    @Column({ type: 'int', nullable: false, comment: '사용자 idx' })
    user_id: number;

    @ManyToOne(() => User, (user) => user.bids, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'int', nullable: false, comment: '입찰 금액' })
    bid_amount: number;

    @CreateDateColumn({ type: 'datetime' })
    created_at: Date;
}
