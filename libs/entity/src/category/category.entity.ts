import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'Categories' })
export class Category extends BaseEntity {
    @PrimaryColumn({ type: 'char', length: 4, comment: '상품 분류 코드' })
    c_code: string;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: false,
        comment: '상품 분류 코드 이름',
    })
    c_name: string;
}
