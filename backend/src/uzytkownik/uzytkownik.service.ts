import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Uzytkownik } from '../uzytkownik/uzytkownik.entity';
import { CreateUzytkownikDto, UpdateUzytkownikDto } from '../DTOs/uzytkownik.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UzytkownikService {
  constructor(
    @InjectRepository(Uzytkownik)
    private readonly uzytkownikRepository: Repository<Uzytkownik>,
  ) { }
  private users: Uzytkownik[] = [];
  private idCounter = 1;

  async create(createUzytkownikDto: CreateUzytkownikDto): Promise<Uzytkownik> {
    try {
        createUzytkownikDto.haslo = await bcrypt.hash(createUzytkownikDto.haslo, 10);
        const uzytkownik = this.uzytkownikRepository.create({
            ...createUzytkownikDto,
            rola: { rola_id: createUzytkownikDto.rola_id }
        });
        return await this.uzytkownikRepository.save(uzytkownik);
    } catch (error) {
        console.error(error);
        throw new Error('Nie udało się utworzyć użytkownika');
    }
}


  async findAll(): Promise<Uzytkownik[]> {
    return await this.uzytkownikRepository.find({
      relations: ['rola'],
    });
  }

  async findOneByUsername(username: string): Promise<Uzytkownik> {
    const uzytkownik = await this.uzytkownikRepository.findOne({
      where: { login: username },
      relations: ['rola'],
    });
    if (!uzytkownik) {
      throw new NotFoundException(`Użytkownik: ${username} nie znaleziony`);
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
