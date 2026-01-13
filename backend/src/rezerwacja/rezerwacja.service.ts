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
    const rezerwacja = this.rezerwacjaRepository.create({
      ...createRezerwacjaDto
    });
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

  // Find reservations for a given restaurant, date, and hour
  async findOccupied(restauracja_id: number, data: string, godzina: string): Promise<Rezerwacja[]> {
    // Parse godzina as HH:mm
    const [h, m] = godzina.split(':').map(Number);
    const date = new Date(`${data}T${godzina}:00`);
    const before = new Date(date.getTime() - 60 * 60 * 1000); // -1h
    const after = new Date(date.getTime() + 60 * 60 * 1000);  // +1h
    const godzinaStart = before.toTimeString().slice(0,5);
    const godzinaEnd = after.toTimeString().slice(0,5);
    // Use queryBuilder for BETWEEN
    return await this.rezerwacjaRepository.createQueryBuilder('rezerwacja')
      .where('rezerwacja.restauracja_id = :restauracja_id', { restauracja_id })
      .andWhere('rezerwacja.data = :data', { data })
      .andWhere('rezerwacja.godzina BETWEEN :start AND :end', { start: godzinaStart, end: godzinaEnd })
      .getMany();
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
