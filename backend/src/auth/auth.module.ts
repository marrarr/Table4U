import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UzytkownikModule } from '../uzytkownik/uzytkownik.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    JwtModule.register({ 
      secret: 'SECRET_KEY', 
      signOptions: { expiresIn: '1h' },
    }),
    UzytkownikModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], 
})
export class AuthModule {}
