import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restauracja } from '../restauracja.entity';
import { restauracjaObraz } from './restauracjaObraz.entity';
import { RestauracjaObrazService } from './restauracjaObraz.service';
import { RestauracjaObrazController } from './restauracjaObraz.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([restauracjaObraz, Restauracja]),
  ],
  controllers: [RestauracjaObrazController],
  providers: [RestauracjaObrazService],
  exports: [RestauracjaObrazService],
})
export class RestauracjaObrazModule {}
