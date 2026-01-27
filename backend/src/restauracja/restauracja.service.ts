import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Restauracja } from './restauracja.entity';
import {
  CreateRestauracjaDto,
  type RestauracjaApiDto,
  UpdateRestauracjaDto,
  UpdateStolikLayoutDto,
} from '../DTOs/restauracja.dto';
import { RestauracjaObraz } from './obrazy/restauracjaObraz.entity';
import { Rezerwacja } from '../rezerwacja/rezerwacja.entity';
import { Stolik } from '../stolik/stolik.entity';

// Interface dla tworzenia stolików
interface CreateStolikDto {
  id: number;
  seats: number;
  top: number;
  left: number;
}

@Injectable()
export class RestauracjaService {
  constructor(
    @InjectRepository(Restauracja)
    private readonly restauracjaRepository: Repository<Restauracja>,
    @InjectRepository(RestauracjaObraz)
    private readonly obrazRepository: Repository<RestauracjaObraz>,
    @InjectRepository(Stolik)  // <-- DODANE
    private readonly stolikRepository: Repository<Stolik>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createRestauracjaDto: CreateRestauracjaDto,
    obrazy?: Express.Multer.File[],
  ): Promise<Restauracja> {
    const restauracja = this.restauracjaRepository.create({
      nazwa: createRestauracjaDto.nazwa,
      adres: createRestauracjaDto.adres,
      nr_kontaktowy: createRestauracjaDto.nr_kontaktowy,
      email: createRestauracjaDto.email,
      wlasciciele: createRestauracjaDto.wlasciciele || [],
    });

    const saved = await this.restauracjaRepository.save(restauracja);

    // Zapisz zdjęcia jeśli przesłano
    if (obrazy && obrazy.length > 0) {
      const plik = obrazy[0];
      const obraz = this.obrazRepository.create({
        restauracja: saved,
        obraz: plik.buffer,
        typ: plik.mimetype,
        nazwa_pliku: plik.originalname,
        rozmiar: plik.size,
        czy_glowne: true,
      });
      await this.obrazRepository.save(obraz);
    }

    const reloaded = await this.restauracjaRepository.findOne({
      where: { restauracja_id: saved.restauracja_id },
      relations: ['obraz'],
    });

    return reloaded || saved;
  }

  // Alias for tests / English naming
  async findAll(): Promise<RestauracjaApiDto[]> {
    return this.pobierzWszystkie();
  }

  // Alias for tests / English naming
  async findOne(id: number): Promise<RestauracjaApiDto> {
    return this.pobierz(id);
  }

  zapisz(restauracja: Restauracja): Promise<Restauracja> {
    return this.restauracjaRepository.save(restauracja);
  }

  async pobierzWszystkie(): Promise<RestauracjaApiDto[]> {
    const list = await this.restauracjaRepository.find({
      relations: ['obraz'],
    });
    return list.map((r) => this.toApi(r));
  }

  async pobierzDlaUzytkownika(uzytkownik: {
    username: string;
    role: string;
  }): Promise<RestauracjaApiDto[]> {
    if (uzytkownik.role === 'admin') {
      const list = await this.restauracjaRepository.find({
        relations: ['wlasciciele', 'obraz'],
      });
      return list.map((r) => this.toApi(r));
    } else if (uzytkownik.role === 'owner') {
      const list = await this.restauracjaRepository
        .createQueryBuilder('restauracja')
        .leftJoinAndSelect('restauracja.wlasciciele', 'uzytkownik')
        .leftJoinAndSelect('restauracja.obraz', 'obraz')
        .where('uzytkownik.login = :login', { login: uzytkownik.username })
        .getMany();

      return list.map((r) => this.toApi(r));
    }
    return [];
  }

  async pobierz(id: number): Promise<RestauracjaApiDto> {
    const restauracja = await this.restauracjaRepository.findOne({
      where: { restauracja_id: id },
      relations: ['obraz'],
    });
    if (!restauracja)
      throw new NotFoundException(`Restauracja z ID ${id} nie znaleziona`);
    return this.toApi(restauracja);
  }

  async zapiszLubAktualizuj(
    id: number,
    updateRestauracjaDto: UpdateRestauracjaDto,
  ): Promise<Restauracja> {
    let restauracja = await this.restauracjaRepository.findOne({
      where: { restauracja_id: id },
      relations: ['obraz', 'wlasciciele'],
    });

    if (!restauracja) {
      const newRestauracja = this.restauracjaRepository.create({
        restauracja_id: id,
        ...updateRestauracjaDto,
      });
      const saved = await this.restauracjaRepository.save(newRestauracja);

      restauracja = await this.restauracjaRepository.findOne({
        where: { restauracja_id: saved.restauracja_id },
          relations: ['obraz', 'wlasciciele'],
      });

      if (!restauracja) {
        throw new NotFoundException(
          `Restauracja z ID ${id} nie znaleziona po utworzeniu`,
        );
      }

      return restauracja;
    }

    Object.assign(restauracja, {
      nazwa: updateRestauracjaDto.nazwa ?? restauracja.nazwa,
      adres: updateRestauracjaDto.adres ?? restauracja.adres,
      nr_kontaktowy:
        updateRestauracjaDto.nr_kontaktowy ?? restauracja.nr_kontaktowy,
      email: updateRestauracjaDto.email ?? restauracja.email,
      wlasciciele: updateRestauracjaDto.wlasciciele ?? restauracja.wlasciciele,
    });

    const saved = await this.restauracjaRepository.save(restauracja);

    const reloaded = await this.restauracjaRepository.findOne({
      where: { restauracja_id: saved.restauracja_id },
        relations: ['obraz', 'wlasciciele'],
    });

    if (!reloaded) {
      throw new NotFoundException(
        `Restauracja z ID ${id} nie znaleziona po aktualizacji`,
      );
    }

    return reloaded;
  }

  async usun(
    id: number,
    user?: { id?: number; userId?: number; role?: string; username?: string },
  ): Promise<void> {
    const restauracja = await this.restauracjaRepository.findOne({
      where: { restauracja_id: id },
      relations: ['wlasciciele'],
    });

    if (!restauracja) {
      throw new NotFoundException(`Restauracja z ID ${id} nie znaleziona`);
    }

    // Jeśli użytkownik został przekazany, sprawdź uprawnienia
    if (user) {
      if (user.role !== 'admin') {
        const providedUserId = (user.userId ?? user.id) as number | undefined;
        const isOwner = providedUserId
          ? restauracja.wlasciciele.some((w) => w.uzytkownik_id === providedUserId)
          : restauracja.wlasciciele.some((w) => w.login === user.username);
        if (!isOwner) {
          throw new ForbiddenException('Brak dostępu do usunięcia tej restauracji');
        }
      }
    }

    // Usuń powiązane rekordy w transakcji, żeby uniknąć zależności FK
    await this.dataSource.transaction(async (manager) => {
      // Usuń rezerwacje powiązane z restauracją
      await manager.delete(Rezerwacja, { restauracja_id: id });

      // Usuń stoliki powiązane z restauracją (zazwyczaj ma cascade onDelete, ale usuwamy explicite)
      await manager.delete(Stolik, { restauracja_id: id });

      // Usuń obraz restauracji jeśli istnieje (RestauracjaObraz nie ma pola restauracja_id w encji)
      await manager
        .createQueryBuilder()
        .delete()
        .from(RestauracjaObraz)
        .where('restauracja_id = :id', { id })
        .execute();

        // Usuń wpisy many-to-many (wlasciciele) w tabeli łączącej, jeśli istnieją
        if (restauracja.wlasciciele && restauracja.wlasciciele.length > 0) {
          const ownerIds = restauracja.wlasciciele.map((w) => w.uzytkownik_id);
          try {
            await manager
              .createQueryBuilder()
              .relation(Restauracja, 'wlasciciele')
              .of(restauracja.restauracja_id)
              .remove(ownerIds as any);
          } catch (e) {
            // jeśli relation.remove nie działa z id-ami, spróbuj po obiektach
            try {
              await manager
                .createQueryBuilder()
                .relation(Restauracja, 'wlasciciele')
                .of(restauracja)
                .remove(restauracja.wlasciciele as any);
            } catch (err) {
              // log serwera i rzuć dalej — transaction rollback
              console.error('Błąd usuwania relacji wlasciciele:', err);
              throw err;
            }
          }
        }

      // Na końcu usuń samą restaurację
      const res = await manager.delete(Restauracja, { restauracja_id: id });
      if (res.affected === 0) {
        throw new NotFoundException(`Restauracja z ID ${id} nie znaleziona przy usuwaniu`);
      }
    });
  }

  private toApi(restauracja: Restauracja) {
    return {
      restauracja_id: restauracja.restauracja_id,
      nazwa: restauracja.nazwa,
      adres: restauracja.adres,
      nr_kontaktowy: restauracja.nr_kontaktowy,
      email: restauracja.email,
      obraz: restauracja.obraz
        ? {
            id: restauracja.obraz.id,
            nazwa_pliku: restauracja.obraz.nazwa_pliku,
            typ: restauracja.obraz.typ,
            rozmiar: restauracja.obraz.rozmiar,
            czy_glowne: restauracja.obraz.czy_glowne,
            obrazBase64: restauracja.obraz.obraz
              ? restauracja.obraz.obraz.toString('base64')
              : undefined,
          }
        : null,
    };
  }

  async aktualizujLayout(
    restauracjaId: number,
    stoliki: UpdateStolikLayoutDto[],
    userId: number,
  ): Promise<void> {
    const restauracja = await this.restauracjaRepository.findOne({
      where: { restauracja_id: restauracjaId },
      relations: ['wlasciciele'],
    });

    if (!restauracja) {
      throw new NotFoundException('Restauracja nie istnieje');
    }

    const isOwner = restauracja.wlasciciele.some(
      (w) => w.uzytkownik_id === userId,
    );

    if (!isOwner) {
      throw new ForbiddenException('Brak dostępu do edycji layoutu');
    }

    await this.dataSource.transaction(async (manager) => {
      for (const stolik of stoliki) {
        const result = await manager.update(
          Stolik,
          {
            stolik_id: stolik.stolik_id,
            restauracja_id: restauracjaId,
          },
          {
            pozycjaX_UI: stolik.pozycjaX_UI,
            pozycjaY_UI: stolik.pozycjaY_UI,
          },
        );

        if (result.affected === 0) {
          throw new NotFoundException(
            `Stolik ${stolik.stolik_id} nie należy do tej restauracji`,
          );
        }
      }
    });
  }

  // =============================================
  // NOWA METODA: Zapisywanie całego układu stolików
  // =============================================
  async zapiszUkladStolow(
    restauracjaId: number,
    stoliki: CreateStolikDto[],
    userId: number,
  ): Promise<number> {
    // 1. Sprawdź czy restauracja istnieje i user ma uprawnienia
    const restauracja = await this.restauracjaRepository.findOne({
      where: { restauracja_id: restauracjaId },
      relations: ['wlasciciele'],
    });

    if (!restauracja) {
      throw new NotFoundException('Restauracja nie istnieje');
    }

    const isOwner = restauracja.wlasciciele.some(
      (w) => w.uzytkownik_id === userId,
    );

    if (!isOwner) {
      throw new ForbiddenException('Brak dostępu do edycji układu');
    }

    // 2. Usuń istniejące stoliki dla tej restauracji
    await this.stolikRepository.delete({ restauracja_id: restauracjaId });

    // 3. Utwórz nowe stoliki
const createdStoliki: Stolik[] = [];

for (const stolikData of stoliki) {
  const stolik = this.stolikRepository.create({
    restauracja_id: restauracjaId,
    numer_stolika: stolikData.id,
    ilosc_miejsc: stolikData.seats, // pole danych z frontend (seats)
    lokalizacja: 'Sala główna',     // DODANO: wymagane pole z encji
    pozycjaX_UI: stolikData.left,
    pozycjaY_UI: stolikData.top,
    // Usunięto pole status, bo nie istnieje w encji Stolik
  });
  createdStoliki.push(stolik);
}

    await this.stolikRepository.save(createdStoliki);

    return createdStoliki.length;
  }
}