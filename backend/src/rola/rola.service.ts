import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rola } from '../rola/rola.entity';
import { CreateRolaDto, UpdateRolaDto } from '../DTOs/rola.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Rola)
    private readonly rolaRepository: Repository<Rola>,
  ) {}

  async create(createRolaDto: CreateRolaDto): Promise<Rola> {
    const rola = this.rolaRepository.create(createRolaDto);
    return await this.rolaRepository.save(rola);
  }

  async findAll(): Promise<Rola[]> {
    return await this.rolaRepository.find();
  }

  async findOne(id: number): Promise<Rola> {
    const rola = await this.rolaRepository.findOne({
      where: { rola_id: id },
    });
    if (!rola) {
      throw new NotFoundException(`Rola z ID ${id} nie znaleziona`);
    }
    return rola;
  }

  async upsert(id: number, updateRolaDto: UpdateRolaDto): Promise<Rola> {
    const rola = await this.rolaRepository.findOne({
      where: { rola_id: id },
    });

    if (rola) {
      Object.assign(rola, updateRolaDto);
      return await this.rolaRepository.save(rola);
    } else {
      const newRola = this.rolaRepository.create({
        rola_id: id,
        ...updateRolaDto,
      });
      return await this.rolaRepository.save(newRola);
    }
  }

  async remove(id: number): Promise<void> {
    const result = await this.rolaRepository.delete({ rola_id: id });
    if (result.affected === 0) {
      throw new NotFoundException(`Rola z ID ${id} nie znaleziona`);
    }
  }
}
