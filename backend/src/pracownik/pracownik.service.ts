import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pracownik } from './pracownik.entity';
import { CreatePracownikDto, UpdatePracownikDto } from './pracownik.dto';

@Injectable()
export class PracownityService {
  constructor(
    @InjectRepository(Pracownik)
    private readonly pracownikRepository: Repository<Pracownik>,
  ) {}

  async create(createPracownikDto: CreatePracownikDto): Promise<Pracownik> {
    const pracownik = this.pracownikRepository.create(createPracownikDto);
    return await this.pracownikRepository.save(pracownik);
  }

  async findAll(): Promise<Pracownik[]> {
    return await this.pracownikRepository.find();
  }

  async findOne(id: number): Promise<Pracownik> {
    const pracownik = await this.pracownikRepository.findOne({
      where: { pracownik_id: id },
    });
    if (!pracownik) {
      throw new NotFoundException(`Pracownik z ID ${id} nie znaleziony`);
    }
    return pracownik;
  }

  async upsert(id: number, updatePracownikDto: UpdatePracownikDto): Promise<Pracownik> {
    const pracownik = await this.pracownikRepository.findOne({
      where: { pracownik_id: id },
    });

    if (pracownik) {
      Object.assign(pracownik, updatePracownikDto);
      return await this.pracownikRepository.save(pracownik);
    } else {
      const newPracownik = this.pracownikRepository.create({
        pracownik_id: id,
        ...updatePracownikDto,
      });
      return await this.pracownikRepository.save(newPracownik);
    }
  }

  async remove(id: number): Promise<void> {
    const result = await this.pracownikRepository.delete({ pracownik_id: id });
    if (result.affected === 0) {
      throw new NotFoundException(`Pracownik z ID ${id} nie znaleziony`);
    }
  }
}
