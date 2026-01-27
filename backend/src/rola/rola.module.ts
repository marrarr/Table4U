import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rola } from '../rola/rola.entity';
import { RoleService } from './rola.service';
import { RoleController } from './rola.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Rola])],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RolaModule {}
