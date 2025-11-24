import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  findAll(): Promise<Restaurant[]> {
    return this.restaurantRepository.find();
  }
  
  async findOne(id: number): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOneBy({ id });
  if (!restaurant) {
    throw new NotFoundException(`Restaurant with id ${id} not found`);
  }
  return restaurant;
  }

  create(data: Partial<Restaurant>): Promise<Restaurant> {
    const restaurant = this.restaurantRepository.create(data);
    return this.restaurantRepository.save(restaurant);
  }

  async update(id: number, data: Partial<Restaurant>): Promise<Restaurant> {
    await this.restaurantRepository.update(id, data);
    return this.findOne(id);
  }

  delete(id: number): Promise<void> {
    return this.restaurantRepository.delete(id).then(() => undefined);
  }
}
