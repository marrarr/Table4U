import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { RestauracjaService } from './restauracja.service';
import type { CreateRestauracjaDto, UpdateRestauracjaDto } from '../DTOs/restauracja.dto';
import { Restauracja } from './restauracja.entity';

@Controller('restauracja')
export class RestauracjaController {
  constructor(private readonly restauracjaService: RestauracjaService) {}

  @Post()
  create(@Body() createRestauracjaDto: CreateRestauracjaDto): Promise<Restauracja> {        
    return this.restauracjaService.create(createRestauracjaDto);                           //metoda tworząca nową restaurację 
  }

  @Get()
  findAll(): Promise<Restauracja[]> {
    return this.restauracjaService.findAll();                                             //metoda pobierająca listę wszystkich restauracji                 
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Restauracja> {                                        
    return this.restauracjaService.findOne(+id);                                          //metoda pobierająca jedną restaurację na podstawie jej ID                
  }

  @Put(':id')
  upsert(
    @Param('id') id: string,
    @Body() updateRestauracjaDto: UpdateRestauracjaDto,
  ): Promise<Restauracja> {
    return this.restauracjaService.upsert(+id, updateRestauracjaDto);                    //metoda aktualizująca dane restauracji na podstawie jej ID               
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.restauracjaService.remove(+id);                                          //metoda usuwająca restaurację na podstawie jej ID                  
  }
}
