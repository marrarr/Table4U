import { AppDataSource } from '../../data-source';
import { Rezerwacja } from '../../rezerwacja/rezerwacja.entity';
import { Restauracja } from '../../restauracja/restauracja.entity';
import { Stolik } from '../../stolik/stolik.entity';
import { Uzytkownik } from '../../uzytkownik/uzytkownik.entity';

function asDateOnly(d: Date): Date {
  // MySQL DATE lubi “date-only”; ucinamy czas.
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

export async function seedRezerwacje(): Promise<void> {
  const rezerwacjaRepo = AppDataSource.getRepository(Rezerwacja);
  const restauracjaRepo = AppDataSource.getRepository(Restauracja);
  const stolikRepo = AppDataSource.getRepository(Stolik);
  const userRepo = AppDataSource.getRepository(Uzytkownik);

  const restauracja = await restauracjaRepo.findOne({
    where: { nazwa: 'Restauracja Testowa' },
  });
  const stolik1 = await stolikRepo.findOne({ where: { numer_stolika: 1 } });
  const stolik2 = await stolikRepo.findOne({ where: { numer_stolika: 2 } });

  const klient = await userRepo.findOne({
    where: { email: 'adam@example.local' },
  });
  const pracownik = await userRepo.findOne({
    where: { email: 'owner@example.local' },
  }); // tymczasowo jako “pracownik”

  if (!restauracja)
    throw new Error(
      'Brak restauracji "Restauracja Testowa". Odpal seedRestauracje().',
    );
  if (!stolik1 || !stolik2)
    throw new Error('Brak stolików 1/2. Odpal seedStoliki().');
  if (!klient)
    throw new Error(
      'Brak klienta client@example.local. Odpal seedUzytkownicy().',
    );
  if (!pracownik)
    throw new Error(
      'Brak pracownika owner@example.local. Odpal seedUzytkownicy().',
    );

  const dataRezerwacji1 = asDateOnly(new Date('2026-01-10'));
  const dataRezerwacji2 = asDateOnly(new Date('2026-01-11'));

  const planned: Array<{
    stoliki: number[];
    data: string;
    godzina: string;
    liczba_osob: number;
    imie: string;
    telefon: string;
    restauracja_id: number;
  }> = [
    {
      stoliki: [stolik1.stolik_id],
      data: '2026-01-10',
      godzina: '18:00',
      liczba_osob: 2,
      imie: 'Adam',
      telefon: '123456789',
      restauracja_id: restauracja.restauracja_id,
    },
    {
      stoliki: [stolik2.stolik_id],
      data: '2026-01-11',
      godzina: '20:00',
      liczba_osob: 4,
      imie: 'Ewa',
      telefon: '987654321',
      restauracja_id: restauracja.restauracja_id,
    },
  ];

  for (const p of planned) {
    // Możesz dodać warunek exists, jeśli chcesz unikać duplikatów wg nowych pól

    const r = rezerwacjaRepo.create({
      ...p
    });
    await rezerwacjaRepo.save(r);
  }
}
