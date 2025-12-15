import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AppDataSource } from '../src/data-source';
import { Restauracja } from '../src/restauracja/restauracja.entity';
import { Stolik } from '../src/stolik/stolik.entity';

export let app: INestApplication;
export let restauracjaId: number;
export let stolikId: number;

beforeAll(async () => {
  await AppDataSource.initialize();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  // create a restauracja and stolik for tests
  const restauracjaRepo = AppDataSource.getRepository(Restauracja);
  const stolikRepo = AppDataSource.getRepository(Stolik);

  const restauracja = await restauracjaRepo.save({
    nazwa: 'Test Restauracja',
    adres: 'Test Address 1',
    nr_kontaktowy: '000000000',
    email: 'test@rest.pl',
  } as Partial<Restauracja>);

  const stolik = await stolikRepo.save({
    numer_stolika: 1,
    ilosc_miejsc: 4,
    lokalizacja: 'Parter',
  } as Partial<Stolik>);

  restauracjaId = restauracja.restauracja_id;
  stolikId = stolik.stolik_id;
});

afterAll(async () => {
  try {
    if (app) await app.close();
  } catch (e) {
    // ignore
  }

  try {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  } catch (e) {
    // ignore
  }
});
