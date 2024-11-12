import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterBidAndAuctionResult1706009743015
    implements MigrationInterface
{
    name = 'AlterBidAndAuctionResult1706009743015';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`Auction_results\` DROP FOREIGN KEY \`FK_86fddb85d3161c81f412be3d01f\``,
        );
        await queryRunner.query('DROP TABLE Bids');
        await queryRunner.query(`DROP TABLE Auction_results`);
        await queryRunner.query(
            `CREATE TABLE \`Bids\` (\`item_id\` int NOT NULL COMMENT '경매 상품 idx', \`user_id\` varchar(36) NOT NULL COMMENT '사용자 id', \`bid_amount\` int NOT NULL COMMENT '입찰 금액', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_1ddcb9040d215ed7afff84146a\` (\`bid_amount\`), PRIMARY KEY (\`item_id\`, \`user_id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`Auction_results\` (\`item_id\` int NOT NULL COMMENT '경매 상품 idx', \`user_id\` varchar(36) NOT NULL COMMENT '사용자 id', \`final_price\` int NOT NULL COMMENT '낙찰 금액', PRIMARY KEY (\`item_id\`, \`user_id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `ALTER TABLE \`Bids\` ADD CONSTRAINT \`FK_58d2e71aa68a264cf951479349d\` FOREIGN KEY (\`item_id\`) REFERENCES \`Auction_items\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`Bids\` ADD CONSTRAINT \`FK_74e547074c2b9b76d3cc621c94e\` FOREIGN KEY (\`user_id\`) REFERENCES \`Users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`Auction_results\` ADD CONSTRAINT \`FK_cd091b018ef2dc7f78a58fec3ca\` FOREIGN KEY (\`item_id\`) REFERENCES \`Auction_items\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`Auction_results\` DROP FOREIGN KEY \`FK_cd091b018ef2dc7f78a58fec3ca\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`Bids\` DROP FOREIGN KEY \`FK_74e547074c2b9b76d3cc621c94e\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`Bids\` DROP FOREIGN KEY \`FK_58d2e71aa68a264cf951479349d\``,
        );
        await queryRunner.query(`DROP TABLE \`Auction_results\``);
        await queryRunner.query(
            `DROP INDEX \`IDX_1ddcb9040d215ed7afff84146a\` ON \`Bids\``,
        );
        await queryRunner.query(`DROP TABLE \`Bids\``);
    }
}
