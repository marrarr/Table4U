import { AppDataSource } from '../../data-source';
import { Rola } from '../../rola/rola.entity';

export async function seedRole(): Promise<void> {
  const repo = AppDataSource.getRepository(Rola);

  const roles: Array<Pick<Rola, 'nazwa'>> = [
    { nazwa: 'user' },
    { nazwa: 'admin' },
    { nazwa: 'owner' },
  ];

  for (const role of roles) {
    const existing = await repo.findOne({ where: { nazwa: role.nazwa } });
    if (!existing) {
      await repo.save(repo.create(role));
    }
  }
}
