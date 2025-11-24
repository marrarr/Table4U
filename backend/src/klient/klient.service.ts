import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Klient } from './klient.entity';
import { CreateKlientDto, UpdateKlientDto } from './klient.dto';

@Injectable()
export class KlienciService {
  constructor(
    @InjectRepository(Klient)
    private readonly klientRepository: Repository<Klient>,
  ) {}

  // Utwórz nowego klienta
  async create(createKlientDto: CreateKlientDto): Promise<Klient> {
    const klient = this.klientRepository.create(createKlientDto);
    return await this.klientRepository.save(klient);
  }

  // Pobierz wszystkich klientów
  async findAll(): Promise<Klient[]> {
    return await this.klientRepository.find();
  }

  // Pobierz klienta po ID
  async findOne(id: number): Promise<Klient> {
    const klient = await this.klientRepository.findOne({
      where: { klient_id: id },
    });
    if (!klient) {
      throw new NotFoundException(`Klient z ID ${id} nie znaleziony`);
    }
    return klient;
  }

  // Upsert (update lub create)
  async upsert(id: number, updateKlientDto: UpdateKlientDto): Promise<Klient> {
    const klient = await this.klientRepository.findOne({
      where: { klient_id: id },
    });

    if (klient) {
      // Update istniejącego
      Object.assign(klient, updateKlientDto);
      return await this.klientRepository.save(klient);
    } else {
      // Utwórz nowego
      const newKlient = this.klientRepository.create({
        klient_id: id,
        ...updateKlientDto,
      });
      return await this.klientRepository.save(newKlient);
    }
  }

  // Usuń klienta
  async remove(id: number): Promise<void> {
    const result = await this.klientRepository.delete({ klient_id: id });
    if (result.affected === 0) {
      throw new NotFoundException(`Klient z ID ${id} nie znaleziony`);
    }
  }
}
