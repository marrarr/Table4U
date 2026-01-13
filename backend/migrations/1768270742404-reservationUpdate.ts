import { MigrationInterface, QueryRunner } from "typeorm";

export class ReservationUpdate1768270742404 implements MigrationInterface {
    name = 'ReservationUpdate1768270742404'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // DROP COLUMN polecenia usunięte, bo kolumny już nie istnieją
        // Kolumny imie, liczba_osob, stoliki, godzina już istnieją w tabeli rezerwacja
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` ADD \`data\` date NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`restauracja_obraz\` DROP FOREIGN KEY \`FK_efb1a07fe96e93bbdfe25e5b28a\``);
        await queryRunner.query(`DROP INDEX \`IDX_9aa1667dcc5d2fa04faf959f82\` ON \`restauracja_obraz\``);
        await queryRunner.query(`ALTER TABLE \`restauracja_obraz\` CHANGE \`restauracjaRestauracjaId\` \`restauracjaRestauracjaId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` DROP FOREIGN KEY \`FK_cdd58116a197522fd6e8f7fdcb7\``);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` CHANGE \`status\` \`status\` varchar(50) NOT NULL DEFAULT 'NOWA'`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` CHANGE \`data_utworzenia\` \`data_utworzenia\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` CHANGE \`uzytkownik_id\` \`uzytkownik_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` DROP COLUMN \`stolik_id\``);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` ADD \`stolik_id\` int NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_9aa1667dcc5d2fa04faf959f82\` ON \`restauracja_obraz\` (\`restauracjaRestauracjaId\`, \`czy_glowne\`)`);
        await queryRunner.query(`ALTER TABLE \`restauracja_obraz\` ADD CONSTRAINT \`FK_efb1a07fe96e93bbdfe25e5b28a\` FOREIGN KEY (\`restauracjaRestauracjaId\`) REFERENCES \`restauracja\`(\`restauracja_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` ADD CONSTRAINT \`FK_cdd58116a197522fd6e8f7fdcb7\` FOREIGN KEY (\`uzytkownik_id\`) REFERENCES \`uzytkownik\`(\`uzytkownik_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` ADD CONSTRAINT \`FK_9c5b9dd51cf43ad0d7ced1b83af\` FOREIGN KEY (\`stolik_id\`) REFERENCES \`stolik\`(\`stolik_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` DROP FOREIGN KEY \`FK_9c5b9dd51cf43ad0d7ced1b83af\``);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` DROP FOREIGN KEY \`FK_cdd58116a197522fd6e8f7fdcb7\``);
        await queryRunner.query(`ALTER TABLE \`restauracja_obraz\` DROP FOREIGN KEY \`FK_efb1a07fe96e93bbdfe25e5b28a\``);
        await queryRunner.query(`DROP INDEX \`IDX_9aa1667dcc5d2fa04faf959f82\` ON \`restauracja_obraz\``);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` DROP COLUMN \`stolik_id\``);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` ADD \`stolik_id\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` CHANGE \`uzytkownik_id\` \`uzytkownik_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` CHANGE \`data_utworzenia\` \`data_utworzenia\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` CHANGE \`status\` \`status\` varchar(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` ADD CONSTRAINT \`FK_cdd58116a197522fd6e8f7fdcb7\` FOREIGN KEY (\`uzytkownik_id\`) REFERENCES \`uzytkownik\`(\`uzytkownik_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`restauracja_obraz\` CHANGE \`restauracjaRestauracjaId\` \`restauracjaRestauracjaId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_9aa1667dcc5d2fa04faf959f82\` ON \`restauracja_obraz\` (\`restauracjaRestauracjaId\`, \`czy_glowne\`)`);
        await queryRunner.query(`ALTER TABLE \`restauracja_obraz\` ADD CONSTRAINT \`FK_efb1a07fe96e93bbdfe25e5b28a\` FOREIGN KEY (\`restauracjaRestauracjaId\`) REFERENCES \`restauracja\`(\`restauracja_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` DROP COLUMN \`data\``);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` DROP COLUMN \`godzina\``);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` DROP COLUMN \`stoliki\``);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` DROP COLUMN \`liczba_osob\``);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` DROP COLUMN \`imie\``);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` ADD \`imie_nazwisko\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` ADD \`godzina_do\` time NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` ADD \`godzina_od\` time NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` ADD \`data_rezerwacji\` date NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` ADD \`pracownik_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` ADD \`klient_id\` int NOT NULL`);
    }

}
