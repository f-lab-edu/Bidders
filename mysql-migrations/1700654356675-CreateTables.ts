import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1700654356675 implements MigrationInterface {
    name = 'CreateTables1700654356675';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`Auction_results\` (\`item_id\` int NOT NULL COMMENT '경매 상품 idx', \`winning_bid_id\` int NOT NULL COMMENT '낙찰된 입찰 idx', \`final_price\` int NOT NULL COMMENT '낙찰 금액', PRIMARY KEY (\`item_id\`, \`winning_bid_id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`Bids\` (\`id\` int NOT NULL AUTO_INCREMENT, \`item_id\` int NOT NULL COMMENT '경매 상품 idx', \`user_id\` int NOT NULL COMMENT '사용자 idx', \`bid_amount\` int NOT NULL COMMENT '입찰 금액', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`Users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(50) NOT NULL COMMENT '닉네임', \`email\` varchar(50) NOT NULL COMMENT '이메일', \`password\` varchar(255) NOT NULL COMMENT '비밀번호', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`Categories\` (\`c_code\` char(4) NOT NULL COMMENT '상품 분류 코드', \`c_name\` varchar(50) NOT NULL COMMENT '상품 분류 코드 이름', PRIMARY KEY (\`c_code\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`Auction_items\` (\`id\` int NOT NULL AUTO_INCREMENT, \`c_code\` char(4) NULL COMMENT '카테고리 분류 코드', \`title\` varchar(255) NOT NULL COMMENT '경매 등록 상품 이름', \`content\` text NOT NULL COMMENT '경매 등록 상품 설명', \`image\` text NULL COMMENT '경매 등록 상품 이미지 url', \`user_id\` int NOT NULL COMMENT '사용자 idx', \`status\` tinyint NOT NULL COMMENT '경매 진행중 여부' DEFAULT '0', \`likes\` int NOT NULL COMMENT '찜 수' DEFAULT '0', \`start_datetime\` datetime NOT NULL COMMENT '경매 시작 datetime', \`end_datetime\` datetime NOT NULL COMMENT '경매 종료 datetime', \`start_price\` int NOT NULL COMMENT '시작 입찰 가격' DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `ALTER TABLE \`Auction_results\` ADD CONSTRAINT \`FK_cd091b018ef2dc7f78a58fec3ca\` FOREIGN KEY (\`item_id\`) REFERENCES \`Auction_items\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`Auction_results\` ADD CONSTRAINT \`FK_86fddb85d3161c81f412be3d01f\` FOREIGN KEY (\`winning_bid_id\`) REFERENCES \`Bids\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`Bids\` ADD CONSTRAINT \`FK_58d2e71aa68a264cf951479349d\` FOREIGN KEY (\`item_id\`) REFERENCES \`Auction_items\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`Bids\` ADD CONSTRAINT \`FK_74e547074c2b9b76d3cc621c94e\` FOREIGN KEY (\`user_id\`) REFERENCES \`Users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`Auction_items\` ADD CONSTRAINT \`FK_d11265ab3f4259cc9defa5c433e\` FOREIGN KEY (\`c_code\`) REFERENCES \`Categories\`(\`c_code\`) ON DELETE SET NULL ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`Auction_items\` ADD CONSTRAINT \`FK_f4a4826dc1c74ba2a9683d9a0c0\` FOREIGN KEY (\`user_id\`) REFERENCES \`Users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`Auction_items\` DROP FOREIGN KEY \`FK_f4a4826dc1c74ba2a9683d9a0c0\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`Auction_items\` DROP FOREIGN KEY \`FK_d11265ab3f4259cc9defa5c433e\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`Bids\` DROP FOREIGN KEY \`FK_74e547074c2b9b76d3cc621c94e\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`Bids\` DROP FOREIGN KEY \`FK_58d2e71aa68a264cf951479349d\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`Auction_results\` DROP FOREIGN KEY \`FK_86fddb85d3161c81f412be3d01f\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`Auction_results\` DROP FOREIGN KEY \`FK_cd091b018ef2dc7f78a58fec3ca\``,
        );
        await queryRunner.query(`DROP TABLE \`Auction_items\``);
        await queryRunner.query(`DROP TABLE \`Categories\``);
        await queryRunner.query(`DROP TABLE \`Users\``);
        await queryRunner.query(`DROP TABLE \`Bids\``);
        await queryRunner.query(`DROP TABLE \`Auction_results\``);
    }
}
