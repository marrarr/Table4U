import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restauracja } from '../restauracja.entity';
import { RestauracjaObraz } from './restauracjaObraz.entity';
import { RestauracjaObrazService } from './restauracjaObraz.service';
import { RestauracjaObrazController } from './restauracjaObraz.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([RestauracjaObraz, Restauracja]),
  ],
  controllers: [RestauracjaObrazController],
  providers: [RestauracjaObrazService],
  exports: [RestauracjaObrazService],
})
export class RestauracjaObrazModule {}
