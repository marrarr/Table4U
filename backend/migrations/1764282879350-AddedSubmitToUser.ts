import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedSubmitToUser1764282879350 implements MigrationInterface {
    name = 'AddedSubmitToUser1764282879350'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`uzytkownik\` ADD \`confirmed\` tinyint NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`uzytkownik\` DROP COLUMN \`confirmed\``);
    }

}
