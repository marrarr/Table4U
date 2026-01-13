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
    images?: Express.Multer.File[],
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
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const obraz = this.obrazRepository.create({
          restauracja: saved,
          obraz: file.buffer,
          typ: file.mimetype,
          nazwa_pliku: file.originalname,
          rozmiar: file.size,
          czy_glowne: i === 0,
        });
        await this.obrazRepository.save(obraz);
      }
    }

    const reloaded = await this.restauracjaRepository.findOne({
      where: { restauracja_id: saved.restauracja_id },
      relations: ['obrazy'],
    });

    return reloaded || saved;
  }

  save(restauracja: Restauracja): Promise<Restauracja> {
    return this.restauracjaRepository.save(restauracja);
  }

  async findAll(): Promise<RestauracjaApiDto[]> {
    const list = await this.restauracjaRepository.find({
      relations: ['obrazy'],
    });
    return list.map((r) => this.toApi(r));
  }

  async findAllByUser(user: {
    username: string;
    role: string;
  }): Promise<RestauracjaApiDto[]> {
    if (user.role === 'admin') {
      const list = await this.restauracjaRepository.find({
        relations: ['wlasciciele', 'obrazy'],
      });
      return list.map((r) => this.toApi(r));
    } else if (user.role === 'owner') {
      const list = await this.restauracjaRepository
        .createQueryBuilder('restauracja')
        .leftJoinAndSelect('restauracja.wlasciciele', 'uzytkownik')
        .leftJoinAndSelect('restauracja.obrazy', 'obrazy')
        .where('uzytkownik.login = :login', { login: user.username })
        .getMany();

      return list.map((r) => this.toApi(r));
    }
    return [];
  }

  async findOne(id: number): Promise<RestauracjaApiDto> {
    const restauracja = await this.restauracjaRepository.findOne({
      where: { restauracja_id: id },
      relations: ['obrazy'],
    });
    if (!restauracja)
      throw new NotFoundException(`Restauracja z ID ${id} nie znaleziona`);
    return this.toApi(restauracja);
  }

  async upsert(
    id: number,
    updateRestauracjaDto: UpdateRestauracjaDto,
  ): Promise<Restauracja> {
    let restauracja = await this.restauracjaRepository.findOne({
      where: { restauracja_id: id },
      relations: ['obrazy', 'wlasciciele'],
    });

    if (!restauracja) {
      const newRestauracja = this.restauracjaRepository.create({
        restauracja_id: id,
        ...updateRestauracjaDto,
      });
      const saved = await this.restauracjaRepository.save(newRestauracja);

      restauracja = await this.restauracjaRepository.findOne({
        where: { restauracja_id: saved.restauracja_id },
        relations: ['obrazy', 'wlasciciele'],
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
      relations: ['obrazy', 'wlasciciele'],
    });

    if (!reloaded) {
      throw new NotFoundException(
        `Restauracja z ID ${id} nie znaleziona po aktualizacji`,
      );
    }

    return reloaded;
  }

  async remove(id: number): Promise<void> {
    const result = await this.restauracjaRepository.delete({
      restauracja_id: id,
    });
    if (result.affected === 0) {
      throw new NotFoundException(`Restauracja z ID ${id} nie znaleziona`);
    }
  }

  private toApi(restauracja: Restauracja) {
    return {
      restauracja_id: restauracja.restauracja_id,
      nazwa: restauracja.nazwa,
      adres: restauracja.adres,
      nr_kontaktowy: restauracja.nr_kontaktowy,
      email: restauracja.email,
      obrazy: (restauracja.obrazy ?? []).map((o) => ({
        id: o.id,
        nazwa_pliku: o.nazwa_pliku,
        typ: o.typ,
        rozmiar: o.rozmiar,
        czy_glowne: o.czy_glowne,
        obrazBase64: o.obraz ? o.obraz.toString('base64') : undefined,
      })),
    };
  }

  async updateLayout(
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
  async saveTableLayout(
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
    ilosc_miejsc: stolikData.seats, // Zmieniono z liczba_miejsc na ilosc_miejsc
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