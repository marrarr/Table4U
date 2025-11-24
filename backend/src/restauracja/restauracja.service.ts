import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restauracja } from './restauracja.entity';
import { CreateRestauracjaDto, UpdateRestauracjaDto } from './restauracja.dto';

@Injectable()
export class RestauracjaService {
  constructor(
    @InjectRepository(Restauracja)
    private readonly restauracjaRepository: Repository<Restauracja>,
  ) {}

  async create(createRestauracjaDto: CreateRestauracjaDto): Promise<Restauracja> {
    const restauracja = this.restauracjaRepository.create(createRestauracjaDto);
    return await this.restauracjaRepository.save(restauracja);
  }

  async findAll(): Promise<Restauracja[]> {
    return await this.restauracjaRepository.find();
  }

  async findOne(id: number): Promise<Restauracja> {
    const restauracja = await this.restauracjaRepository.findOne({
      where: { restauracja_id: id },
    });
    if (!restauracja) {
      throw new NotFoundException(`Restauracja z ID ${id} nie znaleziona`);
    }
    return restauracja;
  }

  async upsert(id: number, updateRestauracjaDto: UpdateRestauracjaDto): Promise<Restauracja> {
    const restauracja = await this.restauracjaRepository.findOne({
      where: { restauracja_id: id },
    });

    if (restauracja) {
      Object.assign(restauracja, updateRestauracjaDto);
      return await this.restauracjaRepository.save(restauracja);
    } else {
      const newRestauracja = this.restauracjaRepository.create({
        restauracja_id: id,
        ...updateRestauracjaDto,
      });
      return await this.restauracjaRepository.save(newRestauracja);
    }
  }

  async remove(id: number): Promise<void> {
    const result = await this.restauracjaRepository.delete({ restauracja_id: id });
    if (result.affected === 0) {
      throw new NotFoundException(`Restauracja z ID ${id} nie znaleziona`);
    }
  }
}
