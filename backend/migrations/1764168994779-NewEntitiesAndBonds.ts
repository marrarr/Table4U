import { MigrationInterface, QueryRunner } from "typeorm";

export class NewEntitiesAndBonds1764168994779 implements MigrationInterface {
    name = 'NewEntitiesAndBonds1764168994779'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`rola\` (\`rola_id\` int NOT NULL AUTO_INCREMENT, \`nazwa\` varchar(50) NOT NULL, UNIQUE INDEX \`IDX_ebef26e61afea204deee459f6a\` (\`nazwa\`), PRIMARY KEY (\`rola_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`stolik\` (\`stolik_id\` int NOT NULL AUTO_INCREMENT, \`numer_stolika\` int NOT NULL, \`ilosc_miejsc\` int NOT NULL, \`lokalizacja\` varchar(255) NOT NULL, PRIMARY KEY (\`stolik_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`restauracja\` (\`restauracja_id\` int NOT NULL AUTO_INCREMENT, \`nazwa\` varchar(255) NOT NULL, \`adres\` varchar(255) NOT NULL, \`nr_kontaktowy\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`zdjecie\` mediumblob NULL, PRIMARY KEY (\`restauracja_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rezerwacja\` (\`rezerwacja_id\` int NOT NULL AUTO_INCREMENT, \`klient_id\` int NOT NULL, \`pracownik_id\` int NOT NULL, \`stolik_id\` int NOT NULL, \`restauracja_id\` int NOT NULL, \`data_utworzenia\` datetime NOT NULL, \`data_rezerwacji\` date NOT NULL, \`godzina_od\` time NOT NULL, \`godzina_do\` time NOT NULL, \`status\` varchar(50) NOT NULL, \`uzytkownik_id\` int NULL, PRIMARY KEY (\`rezerwacja_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`uzytkownik\` (\`uzytkownik_id\` int NOT NULL AUTO_INCREMENT, \`imie\` varchar(100) NOT NULL, \`nazwisko\` varchar(100) NOT NULL, \`email\` varchar(255) NOT NULL, \`telefon\` varchar(20) NOT NULL, \`login\` varchar(100) NOT NULL, \`haslo\` varchar(255) NOT NULL, \`rola_id\` int NOT NULL, UNIQUE INDEX \`IDX_1125ca20331763fe2a98e5ca93\` (\`email\`), UNIQUE INDEX \`IDX_ebaedb599fcf302e1777f8137d\` (\`login\`), PRIMARY KEY (\`uzytkownik_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`restaurant\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`address\` varchar(255) NOT NULL, \`rating\` float NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`uzytkownik_restauracja\` (\`uzytkownik_id\` int NOT NULL, \`restauracja_id\` int NOT NULL, INDEX \`IDX_fad0d7cdd5001cb2d20efbf70d\` (\`uzytkownik_id\`), INDEX \`IDX_f24d6d13cedbcee27d344d245e\` (\`restauracja_id\`), PRIMARY KEY (\`uzytkownik_id\`, \`restauracja_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` ADD CONSTRAINT \`FK_cdd58116a197522fd6e8f7fdcb7\` FOREIGN KEY (\`uzytkownik_id\`) REFERENCES \`uzytkownik\`(\`uzytkownik_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` ADD CONSTRAINT \`FK_9c5b9dd51cf43ad0d7ced1b83af\` FOREIGN KEY (\`stolik_id\`) REFERENCES \`stolik\`(\`stolik_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` ADD CONSTRAINT \`FK_2e3e23535b9e78ead183cdc8743\` FOREIGN KEY (\`restauracja_id\`) REFERENCES \`restauracja\`(\`restauracja_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`uzytkownik\` ADD CONSTRAINT \`FK_68e69961362ef4e0a0a77f12ca9\` FOREIGN KEY (\`rola_id\`) REFERENCES \`rola\`(\`rola_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`uzytkownik_restauracja\` ADD CONSTRAINT \`FK_fad0d7cdd5001cb2d20efbf70d3\` FOREIGN KEY (\`uzytkownik_id\`) REFERENCES \`uzytkownik\`(\`uzytkownik_id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`uzytkownik_restauracja\` ADD CONSTRAINT \`FK_f24d6d13cedbcee27d344d245e8\` FOREIGN KEY (\`restauracja_id\`) REFERENCES \`restauracja\`(\`restauracja_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`uzytkownik_restauracja\` DROP FOREIGN KEY \`FK_f24d6d13cedbcee27d344d245e8\``);
        await queryRunner.query(`ALTER TABLE \`uzytkownik_restauracja\` DROP FOREIGN KEY \`FK_fad0d7cdd5001cb2d20efbf70d3\``);
        await queryRunner.query(`ALTER TABLE \`uzytkownik\` DROP FOREIGN KEY \`FK_68e69961362ef4e0a0a77f12ca9\``);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` DROP FOREIGN KEY \`FK_2e3e23535b9e78ead183cdc8743\``);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` DROP FOREIGN KEY \`FK_9c5b9dd51cf43ad0d7ced1b83af\``);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` DROP FOREIGN KEY \`FK_cdd58116a197522fd6e8f7fdcb7\``);
        await queryRunner.query(`DROP INDEX \`IDX_f24d6d13cedbcee27d344d245e\` ON \`uzytkownik_restauracja\``);
        await queryRunner.query(`DROP INDEX \`IDX_fad0d7cdd5001cb2d20efbf70d\` ON \`uzytkownik_restauracja\``);
        await queryRunner.query(`DROP TABLE \`uzytkownik_restauracja\``);
        await queryRunner.query(`DROP TABLE \`restaurant\``);
        await queryRunner.query(`DROP INDEX \`IDX_ebaedb599fcf302e1777f8137d\` ON \`uzytkownik\``);
        await queryRunner.query(`DROP INDEX \`IDX_1125ca20331763fe2a98e5ca93\` ON \`uzytkownik\``);
        await queryRunner.query(`DROP TABLE \`uzytkownik\``);
        await queryRunner.query(`DROP TABLE \`rezerwacja\``);
        await queryRunner.query(`DROP TABLE \`restauracja\``);
        await queryRunner.query(`DROP TABLE \`stolik\``);
        await queryRunner.query(`DROP INDEX \`IDX_ebef26e61afea204deee459f6a\` ON \`rola\``);
        await queryRunner.query(`DROP TABLE \`rola\``);
    }

}
