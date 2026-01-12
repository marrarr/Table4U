// src/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as path from 'path';
import { config } from 'dotenv';

const isProd = process.env.NODE_ENV === 'production';

// config({ path: path.resolve(__dirname, '../.env') });

if (!isProd) {
  config({ path: path.resolve(process.cwd(), '../.env')})
}

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST || (isProd ? 'db' : '127.0.0.1'),
  port: Number(process.env.DATABASE_PORT) || 3306,
  username: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_SCHEMA || 'table4u3',
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [path.resolve(__dirname, '../migrations/*.ts')],
});
