import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './restaurant.entity';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant])], // <- to rejestruje repozytorium
  providers: [RestaurantService],
  controllers: [RestaurantController],
})
export class RestaurantModule {}
