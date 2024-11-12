import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyBidsTable1701938359425 implements MigrationInterface {
    name = 'ModifyBidsTable1701938359425';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE INDEX \`IDX_1ddcb9040d215ed7afff84146a\` ON \`Bids\` (\`bid_amount\`)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX \`IDX_1ddcb9040d215ed7afff84146a\` ON \`Bids\``,
        );
    }
}
