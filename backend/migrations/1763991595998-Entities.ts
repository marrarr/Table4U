import { MigrationInterface, QueryRunner } from "typeorm";

export class Entities1763991595998 implements MigrationInterface {
    name = 'Entities1763991595998'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`restaurant\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`address\` varchar(255) NOT NULL, \`rating\` float NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`klient\` (\`klient_id\` int NOT NULL AUTO_INCREMENT, \`imie\` varchar(255) NOT NULL, \`nazwisko\` varchar(255) NOT NULL, \`telefon\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, PRIMARY KEY (\`klient_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`pracownik\` (\`pracownik_id\` int NOT NULL AUTO_INCREMENT, \`imie\` varchar(255) NOT NULL, \`nazwisko\` varchar(255) NOT NULL, \`rola\` varchar(255) NOT NULL, \`login\` varchar(255) NOT NULL, \`haslo\` varchar(255) NOT NULL, PRIMARY KEY (\`pracownik_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`restauracja\` (\`restauracja_id\` int NOT NULL AUTO_INCREMENT, \`nazwa\` varchar(255) NOT NULL, \`adres\` varchar(255) NOT NULL, \`nr_kontaktowy\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`zdjecie\` mediumblob NULL, PRIMARY KEY (\`restauracja_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rezerwacja\` (\`rezerwacja_id\` int NOT NULL AUTO_INCREMENT, \`klient_id\` int NOT NULL, \`pracownik_id\` int NOT NULL, \`stolik_id\` int NOT NULL, \`restauracja_id\` int NOT NULL, \`data_utworzenia\` datetime NOT NULL, \`data_rezerwacji\` date NOT NULL, \`godzina_od\` time NOT NULL, \`godzina_do\` time NOT NULL, \`status\` varchar(50) NOT NULL, PRIMARY KEY (\`rezerwacja_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`stolik\` (\`stolik_id\` int NOT NULL AUTO_INCREMENT, \`imie\` int NOT NULL, \`nazwisko\` int NOT NULL, \`email\` varchar(255) NOT NULL, PRIMARY KEY (\`stolik_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` ADD CONSTRAINT \`FK_d4f7e64810c3c440f275dc9a297\` FOREIGN KEY (\`klient_id\`) REFERENCES \`klient\`(\`klient_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` ADD CONSTRAINT \`FK_e0441aaecaa66acfbabb2b756b1\` FOREIGN KEY (\`pracownik_id\`) REFERENCES \`pracownik\`(\`pracownik_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` ADD CONSTRAINT \`FK_9c5b9dd51cf43ad0d7ced1b83af\` FOREIGN KEY (\`stolik_id\`) REFERENCES \`stolik\`(\`stolik_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` ADD CONSTRAINT \`FK_2e3e23535b9e78ead183cdc8743\` FOREIGN KEY (\`restauracja_id\`) REFERENCES \`restauracja\`(\`restauracja_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` DROP FOREIGN KEY \`FK_2e3e23535b9e78ead183cdc8743\``);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` DROP FOREIGN KEY \`FK_9c5b9dd51cf43ad0d7ced1b83af\``);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` DROP FOREIGN KEY \`FK_e0441aaecaa66acfbabb2b756b1\``);
        await queryRunner.query(`ALTER TABLE \`rezerwacja\` DROP FOREIGN KEY \`FK_d4f7e64810c3c440f275dc9a297\``);
        await queryRunner.query(`DROP TABLE \`stolik\``);
        await queryRunner.query(`DROP TABLE \`rezerwacja\``);
        await queryRunner.query(`DROP TABLE \`restauracja\``);
        await queryRunner.query(`DROP TABLE \`pracownik\``);
        await queryRunner.query(`DROP TABLE \`klient\``);
        await queryRunner.query(`DROP TABLE \`restaurant\``);
    }

}
