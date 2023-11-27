import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import { Bid } from '../../bid/entities/bid.entity';
import { AuctionItem } from '../../auction-item/entities/auction-item.entity';

@Entity({ name: 'Users' })
@Unique(['email'])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid', { name: 'id', comment: '사용자 id' })
    id: string;

    @OneToMany(() => AuctionItem, (auctionItem) => auctionItem.user)
    auction_items: AuctionItem[];

    @OneToMany(() => Bid, (bid) => bid.user)
    bids: Bid[];

    @Column({ type: 'varchar', length: 50, nullable: false, comment: '닉네임' })
    username: string;

    @Column({ type: 'varchar', length: 50, nullable: false, comment: '이메일' })
    email: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        comment: '비밀번호',
    })
    password: string;

    @CreateDateColumn({ type: 'datetime' })
    created_at: Date;

    @UpdateDateColumn({ type: 'datetime' })
    updated_at: Date;

    @DeleteDateColumn({ type: 'datetime' })
    deleted_at: Date;
}
