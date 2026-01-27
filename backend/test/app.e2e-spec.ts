import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;
  let testUserId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        //Testy są dla bazy danych testwowej a nie dewelopersiej. Należy utworzyć bazę o nazwie "table4u_test" w phpmyadmin ręcznie.
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'root', // twoja nazwa użytkownika MySQL
          password: '', // twoje hasło MySQL (może być puste w XAMPP)
          database: 'table4u_test', // baza utworzona w phpMyAdmin
          entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
          synchronize: true, // automatycznie tworzy tabele
          dropSchema: true, // UWAGA: czyści bazę przy każdym uruchomieniu!
          logging: false,
        }),
        AppModule,
      ],
    })
      .overrideModule(AppModule)
      .useModule(AppModule)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Setup: Utwórz testowego użytkownika owner
    const roleRes = await request(app.getHttpServer())
      .post('/role')
      .send({ nazwa: 'owner' })
      .expect(201);

    const userRes = await request(app.getHttpServer())
      .post('/uzytkownik')
      .send({
        imie: 'Test',
        nazwisko: 'Owner',
        email: 'testowner@example.com',
        telefon: '123456789',
        login: 'testowner',
        haslo: 'password123',
        rola_id: roleRes.body.rola_id,
        confirmed: true,
      })
      .expect(201);

    testUserId = userRes.body.uzytkownik_id;

    // Zaloguj się
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'testowner',
        password: 'password123',
      })
      .expect(201);

    authToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  afterEach(async () => {
    // Wyczyść dane między testami
    const dataSource = app.get(DataSource);

    try {
      await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
      
      // Wyczyść tabele oprócz Rola i Uzytkownik
      await dataSource.query('DELETE FROM rezerwacja');
      await dataSource.query('DELETE FROM restauracja_obraz');
      await dataSource.query('DELETE FROM uzytkownik_restauracja');
      await dataSource.query('DELETE FROM restauracja');
      await dataSource.query('DELETE FROM stolik');
      
      await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('POST /role – tworzy rolę', async () => {
    const res = await request(app.getHttpServer())
      .post('/role')
      .send({ nazwa: `integration-role-${Date.now()}` })
      .expect(201);

    expect(res.body).toHaveProperty('rola_id');
  });

  it('GET /role – zwraca listę ról', async () => {
    await request(app.getHttpServer())
      .get('/role')
      .expect(200);
  });

  it('POST /uzytkownik – tworzy użytkownika (wymaga roli)', async () => {
    const roleRes = await request(app.getHttpServer())
      .post('/role')
      .send({ nazwa: `test-role-${Date.now()}` })
      .expect(201);

    const rola_id = roleRes.body.rola_id;

    const res = await request(app.getHttpServer())
      .post('/uzytkownik')
      .send({
        imie: 'Jan',
        nazwisko: 'Kowalski',
        email: `test+${Date.now()}@example.com`,
        telefon: '123456789',
        login: `user${Date.now()}`,
        haslo: 'secret',
        rola_id,
        confirmed: false,
      })
      .expect(201);

    expect(res.body).toHaveProperty('uzytkownik_id');
  });

  it('GET /uzytkownik – zwraca listę użytkowników', async () => {
    await request(app.getHttpServer())
      .get('/uzytkownik')
      .expect(200);
  });

  it('POST /restauracja/:id/obraz – dodaje obraz', async () => {
  const restauracjaRes = await request(app.getHttpServer())
    .post('/restauracja')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      nazwa: `Test Restaurant ${Date.now()}`,
      adres: 'ul. Testowa 1',
      nr_kontaktowy: '123456789',
      email: `restaurant${Date.now()}@test.com`,
    })
    .expect(201);

    const restauracja_id = restauracjaRes.body.restauracja_id;

    const testImagePath = path.join(__dirname, 'fixtures', 'test-image.png');
    const imageBuffer = fs.readFileSync(testImagePath);

    const res = await request(app.getHttpServer())
      .post(`/restauracja/${restauracja_id}/obraz`)
      .set('Authorization', `Bearer ${authToken}`)
      .attach('obraz', imageBuffer, 
        { 
          filename: 'test-image.png', 
          contentType: 'image/png' 
        });

    if (res.status !== 201) {
      console.error('Upload failed:', res.status, res.body, res.text);
    }

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('POST /restauracja/:id/obraz – odrzuca zły format', async () => {
    // Utwórz restaurację
    const restauracjaRes = await request(app.getHttpServer())
      .post('/restauracja')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        nazwa: `Test Restaurant ${Date.now()}`,
        adres: 'ul. Testowa 1',
        nr_kontaktowy: '123456789',
        email: `restaurant${Date.now()}@test.com`,
      })
      .expect(201);

    const restauracja_id = restauracjaRes.body.restauracja_id;

    const fakeText = Buffer.from('this is a text file');
    await request(app.getHttpServer())
      .post(`/restauracja/${restauracja_id}/obraz`)
      .set('Authorization', `Bearer ${authToken}`)
      .attach('obraz', fakeText, { filename: 'test.txt', contentType: 'text/plain' })
      .expect(400);
  });

  it('GET /restauracja – zwraca listę restauracji', async () => {
    await request(app.getHttpServer())
      .get('/restauracja')
      .expect(200);
  });

  it('GET /restauracja/:id – 404 gdy brak', async () => {
    await request(app.getHttpServer())
      .get('/restauracja/99999')
      .expect(404);
  });

  it('POST /stoliki – tworzy stolik', async () => {
    const res = await request(app.getHttpServer())
      .post('/stoliki')
      .send({ numer_stolika: 99, ilosc_miejsc: 4, lokalizacja: 'Test' })
      .expect(201);

    expect(res.body).toHaveProperty('stolik_id');
  });

  it('GET /stoliki – zwraca listę stolików', async () => {
    await request(app.getHttpServer())
      .get('/stoliki')
      .expect(200);
  });

  it('POST /rezerwacja – tworzy rezerwację', async () => {
    const response = await request(app.getHttpServer())
      .post('/rezerwacja')
      .send({
        klient_id: testUserId,
        pracownik_id: testUserId,
        stolik_id: 1,
        restauracja_id: 1,
        data_utworzenia: new Date(),
        data_rezerwacji: '2025-01-01',
        godzina_od: '18:00',
        godzina_do: '20:00',
        status: 'AKTYWNA',
      })
      .expect(201);

    expect(response.body).toHaveProperty('rezerwacja_id');
  });

  it('GET /rezerwacja/:id – 404 gdy brak', async () => {
    await request(app.getHttpServer())
      .get('/rezerwacja/99999')
      .expect(404);
  });
});
