import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { UzytkownikService } from './uzytkownik.service';
import type { UpdateUzytkownikDto, CreateUzytkownikDto } from '../DTOs/uzytkownik.dto';
import { Uzytkownik } from '../uzytkownik/uzytkownik.entity';

@Controller('uzytkownik')
export class UzytkownikController {
  constructor(private readonly uzytkownikService: UzytkownikService) {}

  @Post()
  create(@Body() createUzytkownikDto: CreateUzytkownikDto): Promise<Uzytkownik> {
    return this.uzytkownikService.create(createUzytkownikDto);
  }

  @Get()
  pobierzWszystkich(): Promise<Uzytkownik[]> {
    return this.uzytkownikService.pobierzWszystkich();
  }

  @Get(':username')
  pobierzPoLoginie(@Param('username') username: string): Promise<Uzytkownik> {
    return this.uzytkownikService.pobierzPoLoginie(username);
  }

  @Put(':id')
  upsert(
    @Param('id') id: string,
    @Body() updateUzytkownikDto: UpdateUzytkownikDto,
  ): Promise<Uzytkownik> {
    return this.uzytkownikService.zapiszLubAktualizuj(+id, updateUzytkownikDto);
  }

  @Delete(':id')
  usun(@Param('id') id: string): Promise<void> {
    return this.uzytkownikService.usun(+id);
  }
}
