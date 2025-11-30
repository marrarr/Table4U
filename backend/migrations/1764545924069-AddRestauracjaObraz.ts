import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRestauracjaObraz1764545924069 implements MigrationInterface {
    name = 'AddRestauracjaObraz1764545924069'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`restauracja_obraz\` (\`id\` int NOT NULL AUTO_INCREMENT, \`obraz\` longblob NOT NULL, \`nazwa_pliku\` varchar(255) NOT NULL, \`typ\` varchar(255) NOT NULL, \`rozmiar\` int NOT NULL, \`restauracjaRestauracjaId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`restauracja\` CHANGE \`zdjecie\` \`zdjecie\` mediumblob NULL`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` DROP FOREIGN KEY \`FK_cdd58116a197522fd6e8f7fdcb7\``);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` CHANGE \`uzytkownik_id\` \`uzytkownik_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`restauracja_obraz\` ADD CONSTRAINT \`FK_efb1a07fe96e93bbdfe25e5b28a\` FOREIGN KEY (\`restauracjaRestauracjaId\`) REFERENCES \`restauracja\`(\`restauracja_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` ADD CONSTRAINT \`FK_cdd58116a197522fd6e8f7fdcb7\` FOREIGN KEY (\`uzytkownik_id\`) REFERENCES \`uzytkownik\`(\`uzytkownik_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` DROP FOREIGN KEY \`FK_cdd58116a197522fd6e8f7fdcb7\``);
        await queryRunner.query(`ALTER TABLE \`restauracja_obraz\` DROP FOREIGN KEY \`FK_efb1a07fe96e93bbdfe25e5b28a\``);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` CHANGE \`uzytkownik_id\` \`uzytkownik_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` ADD CONSTRAINT \`FK_cdd58116a197522fd6e8f7fdcb7\` FOREIGN KEY (\`uzytkownik_id\`) REFERENCES \`uzytkownik\`(\`uzytkownik_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`restauracja\` CHANGE \`zdjecie\` \`zdjecie\` mediumblob NULL DEFAULT 'NULL'`);
        await queryRunner.query(`DROP TABLE \`restauracja_obraz\``);
    }

}
