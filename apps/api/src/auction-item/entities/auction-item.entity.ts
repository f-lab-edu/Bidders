import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Bid } from '../../bid/entities/bid.entity';
import { AuctionResult } from '../../auction-result/entities/auction-result.entity';
import { Category } from '../../category/entities/category.entity';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'Auction_items' })
export class AuctionItem extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @OneToMany(() => Bid, (bid) => bid.auction_item)
    bids: Bid[];

    @OneToOne(
        () => AuctionResult,
        (auctionResult) => auctionResult.auction_item,
    )
    auction_result: AuctionResult;

    @Column({
        type: 'char',
        length: 4,
        nullable: true,
        comment: '카테고리 분류 코드',
    })
    c_code: string;

    @ManyToOne(() => Category, (category) => category.c_code, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'c_code' })
    category: Category;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        comment: '경매 등록 상품 이름',
    })
    title: string;

    @Column({ type: 'text', nullable: false, comment: '경매 등록 상품 설명' })
    content: string;

    @Column({
        type: 'text',
        nullable: true,
        comment: '경매 등록 상품 이미지 url',
    })
    image: string;

    @Column({
        type: 'varchar',
        length: 36,
        nullable: false,
        comment: '사용자 id',
    })
    user_id: string;

    @ManyToOne(() => User, (user) => user.auction_items, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({
        type: 'tinyint',
        nullable: false,
        default: 0,
        comment: '경매 진행중 여부',
    })
    status: number;

    @Column({ type: 'int', nullable: false, default: 0, comment: '찜 수' })
    likes: number;

    @Column({
        type: 'datetime',
        nullable: false,
        comment: '경매 시작 datetime',
    })
    start_datetime: Date;

    @Column({
        type: 'datetime',
        nullable: false,
        comment: '경매 종료 datetime',
    })
    end_datetime: Date;

    @Column({
        type: 'int',
        nullable: false,
        default: 0,
        comment: '시작 입찰 가격',
    })
    start_price: number;

    @CreateDateColumn({ type: 'datetime' })
    created_at: Date;

    @UpdateDateColumn({ type: 'datetime' })
    updated_at: Date;
}
