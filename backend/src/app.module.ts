import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Rezerwacja } from './entities/rezerwacja.entity';
import { Klient } from './entities/klient.entity';
import { Pracownik } from './entities/pracownik.entity';
import { Stolik } from './entities/stolik.entity';
import { Restauracja } from './entities/restauracja.entity';
import { AppDataSource } from './data-source';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
      envFilePath: '../.env',
    }),
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([
      Rezerwacja,
      Klient,
      Pracownik,
      Stolik,
      Restauracja,
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
