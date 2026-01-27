import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { RezerwacjaService } from './rezerwacja.service';
import type { CreateRezerwacjaDto, UpdateRezerwacjaDto } from '../DTOs/rezerwacja.dto';
import { Rezerwacja } from './rezerwacja.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { Query } from '@nestjs/common';

@Controller('rezerwacja')
export class RezerwacjaController {
  constructor(private readonly rezerwacjaService: RezerwacjaService) {}

  @Post()
  create(@Body() createRezerwacjaDto: CreateRezerwacjaDto): Promise<Rezerwacja> {
    return this.rezerwacjaService.create(createRezerwacjaDto);
  }

  // GET /rezerwacja/moje - rezerwacje użytkownika (user) lub rezerwacje dla restauracji właściciela (owner)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'owner', 'admin')
  @Get('moje')
  async findMy(@Request() req): Promise<Rezerwacja[]> {
    const user = req.user;
    const role = user.role;
    
    console.log('findMy wywołane, user:', user, 'role:', role);
    
    if (role === 'admin') {
      // Admin widzi wszystkie rezerwacje
      const result = await this.rezerwacjaService.pobierzWszystkie();
      console.log('Admin - znaleziono rezerwacje:', result.length);
      return result;
    } else if (role === 'owner') {
      // Owner widzi rezerwacje dla swoich restauracji
      const userId = user.userId ?? user.id;
      console.log('Owner - userId:', userId);
      const result = await this.rezerwacjaService.znajdzDlaWlasciciela(userId);
      console.log('Owner - znaleziono rezerwacje:', result.length);
      return result;
    } else {
      // User widzi swoje rezerwacje
      const userId = user.userId ?? user.id;
      console.log('User - userId:', userId);
      const result = await this.rezerwacjaService.znajdzDlaUzytkownika(userId);
      console.log('User - znaleziono rezerwacje:', result.length);
      return result;
    }
  }

  // GET /rezerwacja/occupied?restauracja_id=1&data=2026-01-13&godzina=18:00
  @Get('occupied')
  async getOccupied(
    @Query('restauracja_id') restauracja_id: string,
    @Query('data') data: string,
    @Query('godzina') godzina: string
  ): Promise<Rezerwacja[]> {
    const rid = Number(restauracja_id);
    return this.rezerwacjaService.znajdzZajete(rid, data, godzina);
  }

  @Get()
  pobierzWszystkie(): Promise<Rezerwacja[]> {
    return this.rezerwacjaService.pobierzWszystkie();
  }

  @Get(':id')
  pobierz(@Param('id') id: string): Promise<Rezerwacja> {
    return this.rezerwacjaService.pobierz(+id);
  }

  @Put(':id')
  upsert(
    @Param('id') id: string,
    @Body() updateRezerwacjaDto: UpdateRezerwacjaDto,
  ): Promise<Rezerwacja> {
    return this.rezerwacjaService.zapiszLubAktualizuj(+id, updateRezerwacjaDto);
  }

  @Delete(':id')
  usun(@Param('id') id: string): Promise<void> {
    return this.rezerwacjaService.usun(+id);
  }
}
