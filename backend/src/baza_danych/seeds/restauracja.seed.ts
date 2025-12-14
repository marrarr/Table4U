import { AppDataSource } from '../../data-source';
import { Restauracja } from '../../restauracja/restauracja.entity';
import { Uzytkownik } from '../../uzytkownik/uzytkownik.entity';
import { RestauracjaObraz } from '../../restauracja/obrazy/restauracjaObraz.entity';
import * as fs from 'fs';
import * as path from 'path';



export async function seedRestauracje(): Promise<void> {
  const restauracjaRepo = AppDataSource.getRepository(Restauracja);
  const userRepo = AppDataSource.getRepository(Uzytkownik);
  const obrazRepo = AppDataSource.getRepository(RestauracjaObraz);

  const nazwa = 'Restauracja Testowa';

  const existing = await restauracjaRepo.findOne({ where: { nazwa } });
  if (existing) return;

  const owner = await userRepo.findOne({
    where: { email: 'owner@example.local' },
  });

  const restauracja = restauracjaRepo.create({
    nazwa,
    adres: 'Testowa 1, 00-000 Warszawa',
    nr_kontaktowy: '000000001',
    email: 'restauracja@example.local',
    wlasciciele: owner ? [owner] : [],
  });

  const savedRestauracja = await restauracjaRepo.save(restauracja);

  const images = ['IMG_1337.png'];

  for (let i = 0; i < images.length; i++) {
    const filePath: string = path.join(__dirname, images[i]);
    const buffer: Buffer = fs.readFileSync(filePath);

    const obraz = obrazRepo.create({
      obraz: buffer,
      nazwa_pliku: images[i],
      typ: 'image/jpeg',
      rozmiar: buffer.length,
      czy_glowne: i === 0, // pierwszy obraz = główny
      restauracja: savedRestauracja,
    });

    await obrazRepo.save(obraz);
  }
}
