import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateStolikiid1765840178217 implements MigrationInterface {
    name = 'UpdateStolikiid1765840178217'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`restauracja_obraz\` DROP FOREIGN KEY \`FK_efb1a07fe96e93bbdfe25e5b28a\``);
        await queryRunner.query(`DROP INDEX \`IDX_9aa1667dcc5d2fa04faf959f82\` ON \`restauracja_obraz\``);
        await queryRunner.query(`ALTER TABLE \`restauracja_obraz\` CHANGE \`restauracjaRestauracjaId\` \`restauracjaRestauracjaId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` DROP FOREIGN KEY \`FK_cdd58116a197522fd6e8f7fdcb7\``);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` CHANGE \`uzytkownik_id\` \`uzytkownik_id\` int NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_9aa1667dcc5d2fa04faf959f82\` ON \`restauracja_obraz\` (\`restauracjaRestauracjaId\`, \`czy_glowne\`)`);
        await queryRunner.query(`ALTER TABLE \`restauracja_obraz\` ADD CONSTRAINT \`FK_efb1a07fe96e93bbdfe25e5b28a\` FOREIGN KEY (\`restauracjaRestauracjaId\`) REFERENCES \`restauracja\`(\`restauracja_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` ADD CONSTRAINT \`FK_cdd58116a197522fd6e8f7fdcb7\` FOREIGN KEY (\`uzytkownik_id\`) REFERENCES \`uzytkownik\`(\`uzytkownik_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` DROP FOREIGN KEY \`FK_cdd58116a197522fd6e8f7fdcb7\``);
        await queryRunner.query(`ALTER TABLE \`restauracja_obraz\` DROP FOREIGN KEY \`FK_efb1a07fe96e93bbdfe25e5b28a\``);
        await queryRunner.query(`DROP INDEX \`IDX_9aa1667dcc5d2fa04faf959f82\` ON \`restauracja_obraz\``);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` CHANGE \`uzytkownik_id\` \`uzytkownik_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` ADD CONSTRAINT \`FK_cdd58116a197522fd6e8f7fdcb7\` FOREIGN KEY (\`uzytkownik_id\`) REFERENCES \`uzytkownik\`(\`uzytkownik_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`restauracja_obraz\` CHANGE \`restauracjaRestauracjaId\` \`restauracjaRestauracjaId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_9aa1667dcc5d2fa04faf959f82\` ON \`restauracja_obraz\` (\`restauracjaRestauracjaId\`, \`czy_glowne\`)`);
        await queryRunner.query(`ALTER TABLE \`restauracja_obraz\` ADD CONSTRAINT \`FK_efb1a07fe96e93bbdfe25e5b28a\` FOREIGN KEY (\`restauracjaRestauracjaId\`) REFERENCES \`restauracja\`(\`restauracja_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
