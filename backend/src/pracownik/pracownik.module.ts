import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pracownik } from './pracownik.entity';
import { PracownityService } from './pracownik.service';
import { PracownityController } from './pracownik.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pracownik])],
  controllers: [PracownityController],
  providers: [PracownityService],
  exports: [PracownityService],
})
export class PracownityModule {}
