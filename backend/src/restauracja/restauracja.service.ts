import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restauracja } from './restauracja.entity';
import { CreateRestauracjaDto, UpdateRestauracjaDto } from '../DTOs/restauracja.dto';

@Injectable()
export class RestauracjaService {
  constructor(
    @InjectRepository(Restauracja)
    private readonly restauracjaRepository: Repository<Restauracja>,
  ) {}

  async create(createRestauracjaDto: CreateRestauracjaDto): Promise<Restauracja> {            //metoda tworząca nową restaurację
    const restauracja = this.restauracjaRepository.create(createRestauracjaDto);              //tworzenie nowej instancji restauracji na podstawie DTO
    return await this.restauracjaRepository.save(restauracja);                                //zapisanie nowej restauracji w bazie danych         
  }
  save(restauracja: Restauracja): Promise<Restauracja> {
    return this.restauracjaRepository.save(restauracja);
  }

  async findAll(): Promise<Restauracja[]> {
    return await this.restauracjaRepository.find();                                            //metoda pobierająca listę wszystkich restauracji            
  }
   async findAllByUser(user: { username: string; role: string }): Promise<Restauracja[]> {
  if (user.role === 'admin') {
    return this.restauracjaRepository.find({ relations: ['wlasciciele'] });
  } else if (user.role === 'owner') {
    return this.restauracjaRepository
      .createQueryBuilder('restauracja')
      .leftJoinAndSelect('restauracja.wlasciciele', 'uzytkownik')
      .where('uzytkownik.login = :login', { login: user.username })
      .getMany();
  } else {
    return [];
  }
}


  async findOne(id: number): Promise<Restauracja> {
    const restauracja = await this.restauracjaRepository.findOne({                            //metoda pobierająca jedną restaurację na podstawie jej ID
      where: { restauracja_id: id },
    });
    if (!restauracja) {
      throw new NotFoundException(`Restauracja z ID ${id} nie znaleziona`);
    }
    return restauracja;
  }

  async upsert(id: number, updateRestauracjaDto: UpdateRestauracjaDto): Promise<Restauracja> {    //metoda aktualizująca dane restauracji na podstawie jej ID           
    const restauracja = await this.restauracjaRepository.findOne({                                //sprawdzenie czy restauracja o podanym ID istnieje
      where: { restauracja_id: id },                                                              
    });

    if (restauracja) {                                                                            //jeśli istnieje, aktualizujemy jej dane                  
      Object.assign(restauracja, updateRestauracjaDto);
      return await this.restauracjaRepository.save(restauracja);                                  
    } else {
      const newRestauracja = this.restauracjaRepository.create({                                //jeśli nie istnieje, tworzymy nową restaurację z podanym ID                 
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

  // metoda pobierająca wszystkie restauracje wraz z obrazami z repo
  async findAllWithImages(): Promise<Restauracja[]> {
    return await this.restauracjaRepository.find({
      relations: ['obrazy']
    });                                           
  }

  // metoda pobierająca restauracje po id wraz z obrazami z repo
  async findOneWithImages(id: number): Promise<Restauracja> {
    const restauracja = await this.restauracjaRepository.findOne({     
      where: { restauracja_id: id },
      relations: ['obrazy'],
    });
    if (!restauracja) {
      throw new NotFoundException(`Restauracja z ID ${id} nie znaleziona`);
    }
    return restauracja;
  }
}
