import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRestaurantTable1763985066893 implements MigrationInterface {
    name = 'CreateRestaurantTable1763985066893'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`restaurant\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`address\` varchar(255) NOT NULL, \`rating\` float NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`restaurant\``);
    }

}
