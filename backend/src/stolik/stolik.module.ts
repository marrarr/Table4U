import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stolik } from './stolik.entity';
import { StolikiService } from './stolik.service';
import { StolikiController } from './stolik.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Stolik])],
  controllers: [StolikiController],
  providers: [StolikiService],
  exports: [StolikiService],
})
export class StolikModule {}
