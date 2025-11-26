import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { RezerwacjaService } from './rezerwacja.service';
import type { CreateRezerwacjaDto, UpdateRezerwacjaDto } from '../DTOs/rezerwacja.dto';
import { Rezerwacja } from './rezerwacja.entity';

@Controller('rezerwacja')
export class RezerwacjaController {
  constructor(private readonly rezerwacjaService: RezerwacjaService) {}

  @Post()
  create(@Body() createRezerwacjaDto: CreateRezerwacjaDto): Promise<Rezerwacja> {
    return this.rezerwacjaService.create(createRezerwacjaDto);
  }

  @Get()
  findAll(): Promise<Rezerwacja[]> {
    return this.rezerwacjaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Rezerwacja> {
    return this.rezerwacjaService.findOne(+id);
  }

  @Put(':id')
  upsert(
    @Param('id') id: string,
    @Body() updateRezerwacjaDto: UpdateRezerwacjaDto,
  ): Promise<Rezerwacja> {
    return this.rezerwacjaService.upsert(+id, updateRezerwacjaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.rezerwacjaService.remove(+id);
  }
}
