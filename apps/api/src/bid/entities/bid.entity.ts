import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { AuctionResult } from '../../auction-result/entities/auction-result.entity';
import { AuctionItem } from '../../auction-item/entities/auction-item.entity';
import { User } from '../../user/entities/user.entity';

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

    @Column({
        type: 'varchar',
        length: 36,
        nullable: false,
        comment: '사용자 id',
    })
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
