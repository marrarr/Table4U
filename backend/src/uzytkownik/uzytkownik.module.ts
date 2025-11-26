import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Uzytkownik } from '../uzytkownik/uzytkownik.entity';
import { UzytkownikService } from './uzytkownik.service';
import { UzytkownikController } from './uzytkownik.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Uzytkownik])],
  controllers: [UzytkownikController],
  providers: [UzytkownikService],
  exports: [UzytkownikService],
})
export class UzytkownikModule {}
