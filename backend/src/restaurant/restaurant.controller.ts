import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { Restaurant } from './restaurant.entity';

@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Get()
  findAll(): Promise<Restaurant[]> {
    return this.restaurantService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Restaurant> {
    return this.restaurantService.findOne(+id);
  }

  @Post()
  create(@Body() data: Partial<Restaurant>): Promise<Restaurant> {
    return this.restaurantService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Restaurant>): Promise<Restaurant> {
    return this.restaurantService.update(+id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.restaurantService.delete(+id);
  }
}
