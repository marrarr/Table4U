import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { RezerwacjaService } from './rezerwacja.service';
import type { CreateRezerwacjaDto, UpdateRezerwacjaDto } from '../DTOs/rezerwacja.dto';
import { Rezerwacja } from './rezerwacja.entity';

import { Query } from '@nestjs/common';

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

  // GET /rezerwacja/occupied?restauracja_id=1&data=2026-01-13&godzina=18:00
  @Get('occupied')
  async getOccupied(
    @Query('restauracja_id') restauracja_id: string,
    @Query('data') data: string,
    @Query('godzina') godzina: string
  ): Promise<Rezerwacja[]> {
    const rid = Number(restauracja_id);
    return this.rezerwacjaService.findOccupied(rid, data, godzina);
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
