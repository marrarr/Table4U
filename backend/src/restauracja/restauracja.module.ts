import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restauracja } from './restauracja.entity';
import { RestauracjaService } from './restauracja.service';
import { RestauracjaController } from './restauracja.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Restauracja])],
  controllers: [RestauracjaController],
  providers: [RestauracjaService],
  exports: [RestauracjaService],
})
export class RestauracjaModule {}
