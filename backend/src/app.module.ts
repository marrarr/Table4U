import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantModule } from './restaurant/restaurant.module';
import { Restaurant } from './restaurant/restaurant.entity';
import { dataSourceOptions } from './data-source';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forRoot({
    ...(dataSourceOptions as TypeOrmModuleOptions),
    migrations: [],
    synchronize: false,
    autoLoadEntities: true,
  }),
  RestaurantModule,
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
