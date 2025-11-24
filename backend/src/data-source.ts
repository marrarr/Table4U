// src/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as path from 'path';
import { config } from 'dotenv';

config({ path: path.resolve(__dirname, '../.env') });


export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT) || 3306,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_SCHEMA,
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  entities: [__dirname + '/**/*.entity{.ts,.js}'], 
  migrations: [path.resolve(__dirname, '../migrations/*.ts')],
});



//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