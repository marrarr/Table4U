import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stolik } from './stolik.entity';
import { CreateStolikDto, UpdateStolikDto } from '../DTOs/stolik.dto';

@Injectable()
export class StolikiService {
  constructor(
    @InjectRepository(Stolik)
    private readonly stolikRepository: Repository<Stolik>,
  ) {}

  async create(createStolikDto: CreateStolikDto): Promise<Stolik> {
    const stolik = this.stolikRepository.create(createStolikDto);
    return await this.stolikRepository.save(stolik);
  }

  async findAll(): Promise<Stolik[]> {
    return await this.stolikRepository.find();
  }

  async findOne(id: number): Promise<Stolik> {
    const stolik = await this.stolikRepository.findOne({
      where: { stolik_id: id },
    });
    if (!stolik) {
      throw new NotFoundException(`Stolik z ID ${id} nie znaleziony`);
    }
    return stolik;
  }

  async upsert(id: number, updateStolikDto: UpdateStolikDto): Promise<Stolik> {
    const stolik = await this.stolikRepository.findOne({
      where: { stolik_id: id },
    });

    if (stolik) {
      Object.assign(stolik, updateStolikDto);
      return await this.stolikRepository.save(stolik);
    } else {
      const newStolik = this.stolikRepository.create({
        stolik_id: id,
        ...updateStolikDto,
      });
      return await this.stolikRepository.save(newStolik);
    }
  }

  async remove(id: number): Promise<void> {
    const result = await this.stolikRepository.delete({ stolik_id: id });
    if (result.affected === 0) {
      throw new NotFoundException(`Stolik z ID ${id} nie znaleziony`);
    }
  }
}
