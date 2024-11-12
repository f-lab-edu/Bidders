import { MigrationInterface, QueryRunner } from 'typeorm';

export class VersioningAuctionResult1705976309021
    implements MigrationInterface
{
    name = 'VersioningAuctionResult1705976309021';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`Auction_results\` ADD \`version\` int NOT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`Auction_results\` DROP COLUMN \`version\``,
        );
    }
}
