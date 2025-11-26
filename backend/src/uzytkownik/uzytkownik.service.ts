import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Uzytkownik } from '../uzytkownik/uzytkownik.entity';
import { CreateUzytkownikDto, UpdateUzytkownikDto } from '../DTOs/uzytkownik.dto';

@Injectable()
export class UzytkownikService {
  constructor(
    @InjectRepository(Uzytkownik)
    private readonly uzytkownikRepository: Repository<Uzytkownik>,
  ) {}

  async create(createUzytkownikDto: CreateUzytkownikDto): Promise<Uzytkownik> {
    const uzytkownik = this.uzytkownikRepository.create(createUzytkownikDto);
    return await this.uzytkownikRepository.save(uzytkownik);
  }

  async findAll(): Promise<Uzytkownik[]> {
    return await this.uzytkownikRepository.find({
      relations: ['rola'],
    });
  }

  async findOne(id: number): Promise<Uzytkownik> {
    const uzytkownik = await this.uzytkownikRepository.findOne({
      where: { uzytkownik_id: id },
      relations: ['rola'],
    });
    if (!uzytkownik) {
      throw new NotFoundException(`Użytkownik z ID ${id} nie znaleziony`);
    }
    return uzytkownik;
  }

  async upsert(id: number, updateUzytkownikDto: UpdateUzytkownikDto): Promise<Uzytkownik> {
    const uzytkownik = await this.uzytkownikRepository.findOne({
      where: { uzytkownik_id: id },
    });

    if (uzytkownik) {
      Object.assign(uzytkownik, updateUzytkownikDto);
      return await this.uzytkownikRepository.save(uzytkownik);
    } else {
      const newUzytkownik = this.uzytkownikRepository.create({
        uzytkownik_id: id,
        ...updateUzytkownikDto,
      });
      return await this.uzytkownikRepository.save(newUzytkownik);
    }
  }

  async remove(id: number): Promise<void> {
    const result = await this.uzytkownikRepository.delete({ uzytkownik_id: id });
    if (result.affected === 0) {
      throw new NotFoundException(`Użytkownik z ID ${id} nie znaleziony`);
    }
  }
}
