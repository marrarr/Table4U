import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { StolikiService } from './stolik.service';
import type { CreateStolikDto,UpdateStolikDto } from '../DTOs/stolik.dto';
import { Stolik } from './stolik.entity';

@Controller('stoliki')
export class StolikiController {
  constructor(private readonly stolikiService: StolikiService) {}

  @Post()
  create(@Body() createStolikDto: CreateStolikDto): Promise<Stolik> {
    return this.stolikiService.create(createStolikDto);
  }

  @Get()
  findAll(): Promise<Stolik[]> {
    return this.stolikiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Stolik> {
    return this.stolikiService.findOne(+id);
  }

  @Put(':id')
  upsert(
    @Param('id') id: string,
    @Body() updateStolikDto: UpdateStolikDto,
  ): Promise<Stolik> {
    return this.stolikiService.upsert(+id, updateStolikDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.stolikiService.remove(+id);
  }
}
