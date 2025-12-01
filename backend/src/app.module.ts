import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RezerwacjaModule } from './rezerwacja/rezerwacja.module';
import { RolaModule } from './rola/rola.module';
import { UzytkownikModule } from './uzytkownik/uzytkownik.module';
import { UzytkownikService } from './uzytkownik/uzytkownik.service';
import { StolikModule } from './stolik/stolik.module';
import { RestauracjaModule } from './restauracja/restauracja.module';
import { AppDataSource } from './data-source';
import { AuthModule } from './auth/auth.module';
import { Uzytkownik } from './uzytkownik/uzytkownik.entity';
import { RestauracjaObrazModule } from './restauracja/obrazy/restauracjaObraz.module';
import { MulterModule } from '@nestjs/platform-express';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      autoLoadEntities: true,
    }),
    RezerwacjaModule,
    UzytkownikModule,
    RolaModule,
    StolikModule,
    RestauracjaModule,
    RestauracjaObrazModule,
    AuthModule,
    MulterModule.register({}),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
