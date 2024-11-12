import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAuctionItem1705998635658 implements MigrationInterface {
    name = 'AlterAuctionItem1705998635658';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`Auction_results\` DROP COLUMN \`version\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`Auction_items\` ADD \`current_price\` int NOT NULL COMMENT '현재 입찰 가격' DEFAULT '0'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`Auction_items\` ADD \`version\` int NOT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`Auction_items\` DROP COLUMN \`version\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`Auction_items\` DROP COLUMN \`current_price\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`Auction_results\` ADD \`version\` int NOT NULL`,
        );
    }
}
