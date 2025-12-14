import { AppDataSource } from '../../data-source';
import { Stolik } from '../../stolik/stolik.entity';

export async function seedStoliki(): Promise<void> {
  const repo = AppDataSource.getRepository(Stolik);

  const stoliki: Array<
    Pick<Stolik, 'numer_stolika' | 'ilosc_miejsc' | 'lokalizacja'>
  > = [
    { numer_stolika: 1, ilosc_miejsc: 2, lokalizacja: 'Sala' },
    { numer_stolika: 2, ilosc_miejsc: 4, lokalizacja: 'Ogródek' },
  ];

  for (const s of stoliki) {
    const existing = await repo.findOne({
      where: { numer_stolika: s.numer_stolika },
    });
    if (!existing) {
      await repo.save(repo.create(s));
    }
  }
}
