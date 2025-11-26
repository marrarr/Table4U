import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rezerwacja } from './rezerwacja.entity';
import { CreateRezerwacjaDto, UpdateRezerwacjaDto } from '../DTOs/rezerwacja.dto';

@Injectable()
export class RezerwacjaService {
  constructor(
    @InjectRepository(Rezerwacja)
    private readonly rezerwacjaRepository: Repository<Rezerwacja>,
  ) {}

  async create(createRezerwacjaDto: CreateRezerwacjaDto): Promise<Rezerwacja> {
    const rezerwacja = this.rezerwacjaRepository.create(createRezerwacjaDto);
    return await this.rezerwacjaRepository.save(rezerwacja);
  }

  async findAll(): Promise<Rezerwacja[]> {
    return await this.rezerwacjaRepository.find({
      relations: ['uzytkownik', 'stolik', 'restauracja'],
    });
  }

  async findOne(id: number): Promise<Rezerwacja> {
    const rezerwacja = await this.rezerwacjaRepository.findOne({
      where: { rezerwacja_id: id },
      relations: ['uzytkownik', 'stolik', 'restauracja'],
    });
    if (!rezerwacja) {
      throw new NotFoundException(`Rezerwacja z ID ${id} nie znaleziona`);
    }
    return rezerwacja;
  }

  async upsert(id: number, updateRezerwacjaDto: UpdateRezerwacjaDto): Promise<Rezerwacja> {
    const rezerwacja = await this.rezerwacjaRepository.findOne({
      where: { rezerwacja_id: id },
    });

    if (rezerwacja) {
      Object.assign(rezerwacja, updateRezerwacjaDto);
      return await this.rezerwacjaRepository.save(rezerwacja);
    } else {
      const newRezerwacja = this.rezerwacjaRepository.create({
        rezerwacja_id: id,
        ...updateRezerwacjaDto,
      });
      return await this.rezerwacjaRepository.save(newRezerwacja);
    }
  }

  async remove(id: number): Promise<void> {
    const result = await this.rezerwacjaRepository.delete({ rezerwacja_id: id });
    if (result.affected === 0) {
      throw new NotFoundException(`Rezerwacja z ID ${id} nie znaleziona`);
    }
  }
}
