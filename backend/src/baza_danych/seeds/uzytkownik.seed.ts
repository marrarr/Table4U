import { AppDataSource } from '../../data-source';
import { Uzytkownik } from '../../uzytkownik/uzytkownik.entity';
import { Rola } from '../../rola/rola.entity';
import * as bcrypt from 'bcryptjs';

export async function seedUzytkownicy(): Promise<void> {
  const userRepo = AppDataSource.getRepository(Uzytkownik);
  const roleRepo = AppDataSource.getRepository(Rola);

  const adminRole = await roleRepo.findOne({ where: { nazwa: 'admin' } });
  const ownerRole = await roleRepo.findOne({ where: { nazwa: 'owner' } });
  const clientRole = await roleRepo.findOne({ where: { nazwa: 'user' } });

  if (!adminRole || !ownerRole || !clientRole) {
    throw new Error('Brakuje ról w DB. Odpal najpierw seedRole().');
  }

  const passwordHash = await bcrypt.hash('URGOAT', 10);

  const users: Array<Partial<Uzytkownik>> = [
    {
      imie: 'Admin',
      nazwisko: 'System',
      email: 'admin@example.local',
      telefon: '000000000',
      login: 'admin',
      haslo: passwordHash,
      confirmed: true,
      rola_id: adminRole.rola_id,
    },
    {
      imie: 'Wlasciciel',
      nazwisko: 'Restauracji',
      email: 'owner@example.local',
      telefon: '000000001',
      login: 'owner',
      haslo: passwordHash,
      confirmed: true,
      rola_id: ownerRole.rola_id,
    },
    {
      imie: 'Kamil',
      nazwisko: 'Mammon',
      email: 'kamil@example.local',
      telefon: '000000002',
      login: 'kamil',
      haslo: passwordHash,
      confirmed: true,
      rola_id: clientRole.rola_id,
    },
    {
      imie: 'Adam',
      nazwisko: 'Testowy',
      email: 'adam@example.local',
      telefon: '000000003',
      login: 'adam',
      haslo: passwordHash,
      confirmed: true,
      rola_id: clientRole.rola_id,
    },
    {
      imie: 'Kasia',
      nazwisko: 'Testowa',
      email: 'kasia@example.local',
      telefon: '000000004',
      login: 'kasia',
      haslo: passwordHash,
      confirmed: true,
      rola_id: clientRole.rola_id,
    },

  ];

  for (const u of users) {
    // email i login są unique — biorę email jako “klucz” seedowania
    const existing = await userRepo.findOne({
      where: { email: u.email as string },
    });

    if (!existing) {
      await userRepo.save(userRepo.create(u));
      continue;
    }

    await userRepo.save(existing);
  }
}
