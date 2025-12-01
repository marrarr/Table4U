import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { RestauracjaService } from './restauracja.service';
import type { CreateRestauracjaDto, UpdateRestauracjaDto } from '../DTOs/restauracja.dto';
import { Restauracja } from './restauracja.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UzytkownikService } from 'src/uzytkownik/uzytkownik.service';

@Controller('restauracja')
export class RestauracjaController {
  constructor(private readonly restauracjaService: RestauracjaService, private readonly uzytkownikService: UzytkownikService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  @Post()
  async create(@Body() createRestauracjaDto: CreateRestauracjaDto,  @Request() req): Promise<Restauracja> { 
    const username = req.user.username;
    const user = await this.uzytkownikService.findOneByUsername(username);
     createRestauracjaDto.wlasciciele = [user];
    return this.restauracjaService.create(createRestauracjaDto);
  }

  @Get()
  findAll(): Promise<Restauracja[]> {
    return this.restauracjaService.findAll();                                             //metoda pobierająca listę wszystkich restauracji                 
  }
 @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  @Get('moje')
  async findAllForUser(@Request() req): Promise<Restauracja[]> {
    const user = req.user;
    return this.restauracjaService.findAllByUser(user);
  }
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Restauracja> {                                        
    return this.restauracjaService.findOne(+id);                                          //metoda pobierająca jedną restaurację na podstawie jej ID                
  }
 

  @Put(':id')
  upsert(
    @Param('id') id: string,
    @Body() updateRestauracjaDto: UpdateRestauracjaDto,
  ): Promise<Restauracja> {
    return this.restauracjaService.upsert(+id, updateRestauracjaDto);                    //metoda aktualizująca dane restauracji na podstawie jej ID               
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.restauracjaService.remove(+id);                                          //metoda usuwająca restaurację na podstawie jej ID                  
  }

  @Get(':id/z-obrazami')
  findOneWithImages(@Param('id') id: string): Promise<Restauracja> {
    return this.restauracjaService.findOneWithImages(+id);
  }

  @Get('z-obrazami')
  findAllWithImages(): Promise<Restauracja[]> {
    return this.restauracjaService.findAllWithImages();
  }

}
