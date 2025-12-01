import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { restauracjaObraz } from './restauracjaObraz.entity';
import { Restauracja } from '../restauracja.entity';

@Injectable()
export class RestauracjaObrazService {
  constructor(
    @InjectRepository(restauracjaObraz)
    private obrazRepository: Repository<restauracjaObraz>,
    @InjectRepository(Restauracja)
    private restauracjaRepository: Repository<Restauracja>,
  ) {}

  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  async dodajObraz(
    restauracjaId: number,
    file: Express.Multer.File,
  ): Promise<restauracjaObraz> {
    this.walidujPlik(file);

    const restauracja = await this.restauracjaRepository.findOne({
      where: { restauracja_id: restauracjaId },
    });

    if (!restauracja) {
      throw new NotFoundException(`Restauracja o ID ${restauracjaId} nie istnieje`);
    }

    const obraz = this.obrazRepository.create({
      obraz: file.buffer,
      nazwa_pliku: file.originalname,
      typ: file.mimetype,
      rozmiar: file.size,
      restauracja: restauracja,
    });

    return await this.obrazRepository.save(obraz);
  }

  async zaktualizujObraz(
    id: number, 
    file: Express.Multer.File
  ): Promise<restauracjaObraz> {
    this.walidujPlik(file);

    const existingObraz = await this.obrazRepository.findOne({
      where: { id },
    });

    if (!existingObraz) {
      throw new NotFoundException(`Obraz o ID ${id} nie istnieje`);
    }

    await this.obrazRepository.update(id, {
      obraz: file.buffer,
      nazwa_pliku: file.originalname,
      typ: file.mimetype,
      rozmiar: file.size,
    });

    const updated = await this.obrazRepository.findOne({ where: { id } });

    if (!updated) {
      throw new NotFoundException(`Obraz o ID ${id} nie istnieje`);
    }

    return updated;
  }

  async usunObraz(id: number): Promise<void> {
    const result = await this.obrazRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Obraz o ID ${id} nie istnieje`);
    }
  }

  private walidujPlik(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('Plik jest wymagany');
    }

    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Nieobsługiwany typ pliku. Dozwolone typy: ${this.ALLOWED_MIME_TYPES.join(', ')}`
      );
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `Plik jest zbyt duży. Maksymalny rozmiar: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }
  }
}