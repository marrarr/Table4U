import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UzytkownikService } from '../uzytkownik/uzytkownik.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateUzytkownikDto } from 'src/DTOs/uzytkownik.dto';

@Injectable()
export class AuthService {
    constructor(private users: UzytkownikService, private jwt: JwtService) { }

    async register(createUzytkownikDto: CreateUzytkownikDto) {
        const uzytkownik = await this.users.create(createUzytkownikDto)
        return { id: uzytkownik.uzytkownik_id, username: uzytkownik.login };
    }

    async login(username: string, password: string) {
        const user = await this.users.findOneByUsername(username);
        if (!user) throw new UnauthorizedException('User not found');

        const valid = await bcrypt.compare(password, user.haslo);
        if (!valid) throw new UnauthorizedException('Wrong password');

        const payload = { username: user.login, sub: user.uzytkownik_id };
        console.log('User logged in:', username);
        return { access_token: this.jwt.sign(payload) };
    }
}
