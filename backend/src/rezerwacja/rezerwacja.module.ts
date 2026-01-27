import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rezerwacja } from './rezerwacja.entity';
import { RezerwacjaService } from './rezerwacja.service';
import { RezerwacjaController } from './rezerwacja.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Rezerwacja])],
  controllers: [RezerwacjaController],
  providers: [RezerwacjaService],
  exports: [RezerwacjaService],
})
export class RezerwacjaModule {}