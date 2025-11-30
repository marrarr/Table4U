import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restauracja } from './restauracja.entity';
import { RestauracjaService } from './restauracja.service';
import { RestauracjaController } from './restauracja.controller';
import { RestauracjaObrazModule } from './obrazy/restauracjaObraz.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restauracja]),
    RestauracjaObrazModule,
  ],
  controllers: [RestauracjaController],
  providers: [RestauracjaService],
  exports: [RestauracjaService],
})
export class RestauracjaModule {}
