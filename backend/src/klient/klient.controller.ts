import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { KlienciService } from './klient.service';
import { CreateKlientDto, UpdateKlientDto } from './klient.dto';
import { Klient } from './klient.entity';

@Controller('klienci')
export class KlienciController {
  constructor(private readonly klienciService: KlienciService) {}

  @Post()
  create(@Body() createKlientDto: CreateKlientDto): Promise<Klient> {
    return this.klienciService.create(createKlientDto);
  }

  @Get()
  findAll(): Promise<Klient[]> {
    return this.klienciService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Klient> {
    return this.klienciService.findOne(+id);
  }

  @Put(':id')
  upsert(
    @Param('id') id: string,
    @Body() updateKlientDto: UpdateKlientDto,
  ): Promise<Klient> {
    return this.klienciService.upsert(+id, updateKlientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.klienciService.remove(+id);
  }
}
