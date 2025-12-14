import { AppDataSource } from '../../data-source';
import { Restauracja } from '../../restauracja/restauracja.entity';
import { Uzytkownik } from '../../uzytkownik/uzytkownik.entity';

export async function seedRestauracje(): Promise<void> {
  const restauracjaRepo = AppDataSource.getRepository(Restauracja);
  const userRepo = AppDataSource.getRepository(Uzytkownik);

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
    zdjecie: undefined,
    wlasciciele: owner ? [owner] : [],
    obrazy: [],
  });

  await restauracjaRepo.save(restauracja);
}
