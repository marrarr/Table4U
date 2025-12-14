import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restauracja } from './restauracja.entity';
import { CreateRestauracjaDto, type RestauracjaApiDto, UpdateRestauracjaDto } from '../DTOs/restauracja.dto';
import { RestauracjaObraz } from './obrazy/restauracjaObraz.entity';

@Injectable()
export class RestauracjaService {
  constructor(
    @InjectRepository(Restauracja)
    private readonly restauracjaRepository: Repository<Restauracja>,
    @InjectRepository(RestauracjaObraz)
    private readonly obrazRepository: Repository<RestauracjaObraz>,
  ) {}

  async create(
    createRestauracjaDto: CreateRestauracjaDto,
  ): Promise<Restauracja> {
    //metoda tworząca nową restaurację
    const restauracja = this.restauracjaRepository.create({
      nazwa: createRestauracjaDto.nazwa,
      adres: createRestauracjaDto.adres,
      nr_kontaktowy: createRestauracjaDto.nr_kontaktowy,
      email: createRestauracjaDto.email,
      wlasciciele: createRestauracjaDto.wlasciciele || [],
    }); //tworzenie nowej instancji restauracji na podstawie DTO

    return await this.restauracjaRepository.save(restauracja); //zapisanie nowej restauracji w bazie danych
    // const saved = await this.restauracjaRepository.save(restauracja);

    // const reloaded = await this.restauracjaRepository.findOne({
    //   where: { restauracja_id: saved.restauracja_id },
    //   relations: ['obrazy'],
    // });

    // return this.toApi(reloaded!);
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

  // Zamieniamy encję na obiekt gotowy dla frontendu (Buffer -> base64)
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
}
