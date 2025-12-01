import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restauracja } from './restauracja.entity';
import { RestauracjaService } from './restauracja.service';
import { RestauracjaController } from './restauracja.controller';
import { RestauracjaObrazModule } from './obrazy/restauracjaObraz.module';
import { UzytkownikModule } from 'src/uzytkownik/uzytkownik.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restauracja]),
    RestauracjaObrazModule,
    UzytkownikModule,
  ],
  controllers: [RestauracjaController],
  providers: [RestauracjaService],
  exports: [RestauracjaService],
})
export class RestauracjaModule {}
