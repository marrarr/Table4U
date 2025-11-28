import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UzytkownikModule } from '../uzytkownik/uzytkownik.module';

@Module({
  imports: [
    JwtModule.register({ 
      secret: 'SECRET_KEY', 
      signOptions: { expiresIn: '1h' } 
    }),
    UzytkownikModule, // <-- importujemy moduł z serwisem i repozytorium
  ],
  controllers: [AuthController],
  providers: [AuthService], // <-- TYLKO AuthService, serwis użytkownika wstrzykiwany z UzytkownikModule
})
export class AuthModule {}
