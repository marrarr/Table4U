import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RestauracjaService } from './restauracja.service';
import type {
  CreateRestauracjaDto,
  RestauracjaApiDto,
  UpdateRestauracjaDto,
  UpdateStolikLayoutDto,
} from '../DTOs/restauracja.dto';
import { Restauracja } from './restauracja.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UzytkownikService } from 'src/uzytkownik/uzytkownik.service';

@Controller('restauracja')
export class RestauracjaController {
  constructor(
    private readonly restauracjaService: RestauracjaService,
    private readonly uzytkownikService: UzytkownikService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  async create(
    @Body() body: any,
    @UploadedFiles() obrazy: Express.Multer.File[],
    @Request() req,
  ): Promise<Restauracja> {
    // Parsowanie pól tekstowych z FormData
    const { nazwa, adres, nr_kontaktowy, email } = body;
    if (!nazwa || !adres || !nr_kontaktowy || !email) throw new Error('Brak danych restauracji!');
    const username = req.user.username;
    const user = await this.uzytkownikService.pobierzPoLoginie(username);
    const createRestauracjaDto: any = {
      nazwa,
      adres,
      nr_kontaktowy,
      email,
      wlasciciele: [user],
    };
    return this.restauracjaService.create(createRestauracjaDto, obrazy);
  }

  @Get()
  pobierzWszystkie(): Promise<RestauracjaApiDto[]> {
    return this.restauracjaService.pobierzWszystkie(); //metoda pobierająca listę wszystkich restauracji
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  @Get('moje')
  async pobierzDlaUzytkownika(@Request() req): Promise<RestauracjaApiDto[]> {
    const user = req.user;
    return this.restauracjaService.pobierzDlaUzytkownika(user);
  }

  @Get(':id')
  pobierz(@Param('id') id: string): Promise<RestauracjaApiDto> {
    return this.restauracjaService.pobierz(+id); //metoda pobierająca jedną restaurację na podstawie jej ID
  }

  @Put(':id')
  zapiszLubAktualizuj(
    @Param('id') id: string,
    @Body() updateRestauracjaDto: UpdateRestauracjaDto,
  ): Promise<Restauracja> {
    return this.restauracjaService.zapiszLubAktualizuj(+id, updateRestauracjaDto); //metoda aktualizująca dane restauracji na podstawie jej ID
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  @Delete(':id')
  usun(@Param('id') id: string, @Request() req): Promise<void> {
    const user = req.user;
    return this.restauracjaService.usun(+id, user); //metoda usuwająca restaurację na podstawie jej ID z walidacją
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  @Put(':id/layout')
  async aktualizujLayout(
    @Param('id') restauracjaId: string,
    @Body() stoliki: UpdateStolikLayoutDto[],
    @Request() req,
  ): Promise<void> {
    const userId = req.user.userId ?? req.user.id;

    return await this.restauracjaService.aktualizujLayout(
      +restauracjaId,
      stoliki,
      userId,
    );
  }
}
