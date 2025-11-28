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
  findAll(): Promise<Uzytkownik[]> {
    return this.uzytkownikService.findAll();
  }

  @Get(':username')
  findOne(@Param('username') username: string): Promise<Uzytkownik> {
    return this.uzytkownikService.findOneByUsername(username);
  }

  @Put(':id')
  upsert(
    @Param('id') id: string,
    @Body() updateUzytkownikDto: UpdateUzytkownikDto,
  ): Promise<Uzytkownik> {
    return this.uzytkownikService.upsert(+id, updateUzytkownikDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.uzytkownikService.remove(+id);
  }
}
