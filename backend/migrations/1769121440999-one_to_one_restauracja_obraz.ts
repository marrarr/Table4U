import { MigrationInterface, QueryRunner } from "typeorm";

export class OneToOneRestauracjaObraz1769121440999 implements MigrationInterface {
    name = 'OneToOneRestauracjaObraz1769121440999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE ` + "`restauracja_obraz`" + ` DROP FOREIGN KEY ` + "`FK_efb1a07fe96e93bbdfe25e5b28a`" + `;`);
        await queryRunner.query(`DROP INDEX ` + "`IDX_9aa1667dcc5d2fa04faf959f82`" + ` ON ` + "`restauracja_obraz`" + `;`);
        await queryRunner.query(`ALTER TABLE ` + "`restauracja_obraz`" + ` CHANGE ` + "`restauracjaRestauracjaId`" + ` ` + "`restauracja_id`" + ` int NULL;`);
        await queryRunner.query(`CREATE UNIQUE INDEX ` + "`IDX_restauracja_id_unique`" + ` ON ` + "`restauracja_obraz`" + ` (
            ` + "`restauracja_id`" + `
        )` + `;`);
        await queryRunner.query(`ALTER TABLE ` + "`restauracja_obraz`" + ` ADD CONSTRAINT ` + "`FK_restauracja_obraz_restauracja_id`" + ` FOREIGN KEY (` + "`restauracja_id`" + `) REFERENCES ` + "`restauracja`" + `(` + "`restauracja_id`" + `) ON DELETE CASCADE ON UPDATE NO ACTION;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE ` + "`restauracja_obraz`" + ` DROP FOREIGN KEY ` + "`FK_restauracja_obraz_restauracja_id`" + `;`);
        await queryRunner.query(`DROP INDEX ` + "`IDX_restauracja_id_unique`" + ` ON ` + "`restauracja_obraz`" + `;`);
        await queryRunner.query(`ALTER TABLE ` + "`restauracja_obraz`" + ` CHANGE ` + "`restauracja_id`" + ` ` + "`restauracjaRestauracjaId`" + ` int NULL;`);
        await queryRunner.query(`CREATE UNIQUE INDEX ` + "`IDX_9aa1667dcc5d2fa04faf959f82`" + ` ON ` + "`restauracja_obraz`" + ` (
            ` + "`restauracjaRestauracjaId`" + `,
            ` + "`czy_glowne`" + `
        )` + `;`);
        await queryRunner.query(`ALTER TABLE ` + "`restauracja_obraz`" + ` ADD CONSTRAINT ` + "`FK_efb1a07fe96e93bbdfe25e5b28a`" + ` FOREIGN KEY (` + "`restauracjaRestauracjaId`" + `) REFERENCES ` + "`restauracja`" + `(` + "`restauracja_id`" + `) ON DELETE CASCADE ON UPDATE NO ACTION;`);
    }
}
