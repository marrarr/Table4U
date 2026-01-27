import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restauracja } from './restauracja.entity';
import { RestauracjaService } from './restauracja.service';
import { RestauracjaController } from './restauracja.controller';
import { RestauracjaObrazModule } from './obrazy/restauracjaObraz.module';
import { UzytkownikModule } from 'src/uzytkownik/uzytkownik.module';
import { RestauracjaObraz } from './obrazy/restauracjaObraz.entity';
import { Stolik } from '../stolik/stolik.entity';  // <-- DODANE

@Module({
  imports: [
    TypeOrmModule.forFeature([Restauracja, RestauracjaObraz, Stolik]),  // <-- DODANE Stolik
    RestauracjaObrazModule,
    UzytkownikModule,
  ],
  controllers: [RestauracjaController],
  providers: [RestauracjaService],
  exports: [RestauracjaService],
})
export class RestauracjaModule {}