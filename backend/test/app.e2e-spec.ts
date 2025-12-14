import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
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
    // najpierw utwórz rolę
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
    // 1x1 PNG (valid image) base64
    const pngBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
    const validPng = Buffer.from(pngBase64, 'base64');
    const res = await request(app.getHttpServer())
      .post(`/restauracja/${1}/obraz`)
      .attach('obraz', validPng, { filename: 'test.png', contentType: 'image/png' });

    if (res.status !== 201) {
      // log for debugging
      // eslint-disable-next-line no-console
      console.error('Upload failed status:', res.status, 'body:', res.body, 'text:', res.text);
    }

    expect(res.status).toBe(201);
  });

  it('POST /restauracja/:id/obraz – odrzuca zły format', async () => {
    const fakeText = Buffer.from('this is a text file');
    await request(app.getHttpServer())
      .post(`/restauracja/${1}/obraz`)
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
        klient_id: 1,
        pracownik_id: 1,
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
