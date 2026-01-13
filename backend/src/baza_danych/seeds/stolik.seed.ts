import { AppDataSource } from '../../data-source';
import { Stolik } from '../../stolik/stolik.entity';
import { Restauracja } from '../../restauracja/restauracja.entity';

export async function seedStoliki(): Promise<void> {
  const repo = AppDataSource.getRepository(Stolik);
  const restauracjaRepo = AppDataSource.getRepository(Restauracja);

  const restauracja = await restauracjaRepo.findOne({
    where: { nazwa: 'Restauracja Testowa' },
  });

  if (!restauracja) {
    console.warn(
      'Nie znaleziono "Restauracja Testowa". Pomiń seedowanie stolików.',
    );
    return;
  }

  const stoliki = [
    {
      numer_stolika: 1,
      ilosc_miejsc: 2,
      lokalizacja: 'Sala',
      pozycjaX_UI: 100,
      pozycjaY_UI: 100,
      restauracja: restauracja,
    },
    {
      numer_stolika: 2,
      ilosc_miejsc: 4,
      lokalizacja: 'Ogródek',
      pozycjaX_UI: 200,
      pozycjaY_UI: 150,
      restauracja: restauracja,
    },
  ];

  for (const s of stoliki) {
    const existing = await repo.findOne({
      where: {
        numer_stolika: s.numer_stolika,
        restauracja_id: restauracja.restauracja_id,
      },
    });
    if (!existing) {
      await repo.save(repo.create(s));
    }
  }
}
