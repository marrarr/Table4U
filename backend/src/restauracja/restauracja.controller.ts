import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { RestauracjaService } from './restauracja.service';
import { CreateRestauracjaDto, UpdateRestauracjaDto } from './restauracja.dto';
import { Restauracja } from './restauracja.entity';

@Controller('restauracja')
export class RestauracjaController {
  constructor(private readonly restauracjaService: RestauracjaService) {}

  @Post()
  create(@Body() createRestauracjaDto: CreateRestauracjaDto): Promise<Restauracja> {
    return this.restauracjaService.create(createRestauracjaDto);
  }

  @Get()
  findAll(): Promise<Restauracja[]> {
    return this.restauracjaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Restauracja> {
    return this.restauracjaService.findOne(+id);
  }

  @Put(':id')
  upsert(
    @Param('id') id: string,
    @Body() updateRestauracjaDto: UpdateRestauracjaDto,
  ): Promise<Restauracja> {
    return this.restauracjaService.upsert(+id, updateRestauracjaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.restauracjaService.remove(+id);
  }
}
