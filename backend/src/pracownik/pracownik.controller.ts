import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { PracownityService } from './pracownik.service';
import { CreatePracownikDto } from './pracownik.dto';
import { UpdatePracownikDto } from './pracownik.dto';
import { Pracownik } from './pracownik.entity';

@Controller('pracownicy')
export class PracownityController {
  constructor(private readonly pracownityService: PracownityService) {}

  @Post()
  create(@Body() createPracownikDto: CreatePracownikDto): Promise<Pracownik> {
    return this.pracownityService.create(createPracownikDto);
  }

  @Get()
  findAll(): Promise<Pracownik[]> {
    return this.pracownityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Pracownik> {
    return this.pracownityService.findOne(+id);
  }

  @Put(':id')
  upsert(
    @Param('id') id: string,
    @Body() updatePracownikDto: UpdatePracownikDto,
  ): Promise<Pracownik> {
    return this.pracownityService.upsert(+id, updatePracownikDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.pracownityService.remove(+id);
  }
}
