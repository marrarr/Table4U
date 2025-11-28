import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { CreateUzytkownikDto } from 'src/DTOs/uzytkownik.dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

@Post('register')
register(@Body() createUzytkownikDto: CreateUzytkownikDto) {
  console.log('Registering user:', createUzytkownikDto);
    return this.auth.register(createUzytkownikDto);
}

  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    console.log('Login attempt for user:', body.username);
    return this.auth.login(body.username, body.password);
  }
}