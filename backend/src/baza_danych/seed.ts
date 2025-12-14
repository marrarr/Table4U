// src/seeds/index.ts
import { AppDataSource } from '../data-source';

import { seedRole } from './seeds/rola.seed';
import { seedUzytkownicy } from './seeds/uzytkownik.seed';
import { seedRestauracje } from './seeds/restauracja.seed';
import { seedStoliki } from './seeds/stolik.seed';
import { seedRezerwacje } from './seeds/rezerwacja.seed';

async function run() {
  await AppDataSource.initialize();

  await seedRole();
  await seedUzytkownicy();
  await seedRestauracje();
  await seedStoliki();
  await seedRezerwacje();

  await AppDataSource.destroy();
  process.exit(0);
}

run();
