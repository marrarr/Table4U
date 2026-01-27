import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { RoleService } from './rola.service';
import type { CreateRolaDto, UpdateRolaDto } from '../DTOs/rola.dto';
import { Rola } from '../rola/rola.entity';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(@Body() createRolaDto: CreateRolaDto): Promise<Rola> {
    return this.roleService.create(createRolaDto);
  }

  @Get()
  findAll(): Promise<Rola[]> {
    return this.roleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Rola> {
    return this.roleService.findOne(+id);
  }

  @Put(':id')
  upsert(
    @Param('id') id: string,
    @Body() updateRolaDto: UpdateRolaDto,
  ): Promise<Rola> {
    return this.roleService.upsert(+id, updateRolaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.roleService.remove(+id);
  }
}
