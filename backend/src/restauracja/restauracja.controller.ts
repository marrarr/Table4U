import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
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

// DTO dla tworzenia/aktualizacji stolików
interface CreateStolikDto {
  id: number;         // ID ze strony frontend (np. 1, 2, 3...)
  seats: number;      // liczba miejsc
  top: number;        // pozycja Y
  left: number;       // pozycja X
}

@Controller('restauracja')
export class RestauracjaController {
  constructor(
    private readonly restauracjaService: RestauracjaService,
    private readonly uzytkownikService: UzytkownikService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  @Post()
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @Body() body: any,
    @UploadedFiles() images: Express.Multer.File[],
    @Request() req,
  ): Promise<Restauracja> {
    const createRestauracjaDto: CreateRestauracjaDto = {
      nazwa: body.nazwa,
      adres: body.adres,
      nr_kontaktowy: body.nr_kontaktowy,
      email: body.email,
    };

    if (!createRestauracjaDto.nazwa || !createRestauracjaDto.adres) {
      throw new Error('Brak wymaganych danych restauracji (nazwa, adres)!');
    }

    const username = req.user.username;
    const user = await this.uzytkownikService.findOneByUsername(username);
    createRestauracjaDto.wlasciciele = [user];

    return this.restauracjaService.create(createRestauracjaDto, images);
  }

  @Get()
  findAll(): Promise<RestauracjaApiDto[]> {
    return this.restauracjaService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  @Get('moje')
  async findAllForUser(@Request() req): Promise<RestauracjaApiDto[]> {
    const user = req.user;
    return this.restauracjaService.findAllByUser(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<RestauracjaApiDto> {
    return this.restauracjaService.findOne(+id);
  }

  @Put(':id')
  upsert(
    @Param('id') id: string,
    @Body() updateRestauracjaDto: UpdateRestauracjaDto,
  ): Promise<Restauracja> {
    return this.restauracjaService.upsert(+id, updateRestauracjaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.restauracjaService.remove(+id);
  }

  // Endpoint do aktualizacji istniejących stolików (pozycje)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  @Put(':id/layout')
  async updateLayout(
    @Param('id') restauracjaId: string,
    @Body() stoliki: UpdateStolikLayoutDto[],
    @Request() req,
  ): Promise<void> {
    const userId = req.user.id;
    return await this.restauracjaService.updateLayout(
      +restauracjaId,
      stoliki,
      userId,
    );
  }

  // NOWY ENDPOINT: Tworzenie/zapisywanie całego układu stolików
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  @Post(':id/stoliki')
  async saveTableLayout(
    @Param('id') restauracjaId: string,
    @Body() stoliki: CreateStolikDto[],
    @Request() req,
  ): Promise<{ message: string; count: number }> {
    const userId = req.user.id;
    const count = await this.restauracjaService.saveTableLayout(
      +restauracjaId,
      stoliki,
      userId,
    );
    return { message: 'Układ stolików zapisany', count };
  }
}