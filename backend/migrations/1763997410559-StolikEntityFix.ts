import { MigrationInterface, QueryRunner } from "typeorm";

export class StolikEntityFix1763997410559 implements MigrationInterface {
    name = 'StolikEntityFix1763997410559'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`stolik\` DROP COLUMN \`imie\``);
        await queryRunner.query(`ALTER TABLE \`stolik\` DROP COLUMN \`nazwisko\``);
        await queryRunner.query(`ALTER TABLE \`stolik\` DROP COLUMN \`email\``);
        await queryRunner.query(`ALTER TABLE \`stolik\` ADD \`numer_stolika\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`stolik\` ADD \`ilosc_miejsc\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`stolik\` ADD \`lokalizacja\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`restauracja\` CHANGE \`zdjecie\` \`zdjecie\` mediumblob NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`restauracja\` CHANGE \`zdjecie\` \`zdjecie\` mediumblob NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`stolik\` DROP COLUMN \`lokalizacja\``);
        await queryRunner.query(`ALTER TABLE \`stolik\` DROP COLUMN \`ilosc_miejsc\``);
        await queryRunner.query(`ALTER TABLE \`stolik\` DROP COLUMN \`numer_stolika\``);
        await queryRunner.query(`ALTER TABLE \`stolik\` ADD \`email\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`stolik\` ADD \`nazwisko\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`stolik\` ADD \`imie\` int NOT NULL`);
    }

}
