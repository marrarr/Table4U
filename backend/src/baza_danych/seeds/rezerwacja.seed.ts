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
    stolik: Stolik;
    data_rezerwacji: Date;
    godzina_od: string;
    godzina_do: string;
    status: string;
  }> = [
    {
      stolik: stolik1,
      data_rezerwacji: dataRezerwacji1,
      godzina_od: '18:00:00',
      godzina_do: '19:30:00',
      status: 'NOWA',
    },
    {
      stolik: stolik2,
      data_rezerwacji: dataRezerwacji2,
      godzina_od: '20:00:00',
      godzina_do: '21:00:00',
      status: 'NOWA',
    },
  ];

  for (const p of planned) {
    const exists = await rezerwacjaRepo.findOne({
      where: {
        restauracja_id: restauracja.restauracja_id,
        stolik_id: p.stolik.stolik_id,
        data_rezerwacji: p.data_rezerwacji,
        godzina_od: p.godzina_od,
      },
    });

    if (exists) continue;

    const r = rezerwacjaRepo.create({
      klient_id: klient.uzytkownik_id,
      pracownik_id: pracownik.uzytkownik_id,
      stolik_id: p.stolik.stolik_id,
      restauracja_id: restauracja.restauracja_id,
      data_utworzenia: new Date(),
      data_rezerwacji: p.data_rezerwacji,
      godzina_od: p.godzina_od,
      godzina_do: p.godzina_do,
      status: p.status,

      // relacje (pomagają przy eager/lazy + czytelność; DB i tak zapisuje FK kolumny)
      uzytkownik: klient,
      stolik: p.stolik,
      restauracja,
    });

    await rezerwacjaRepo.save(r);
  }
}
