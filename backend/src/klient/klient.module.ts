import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Klient } from './klient.entity';
import { KlienciService } from './klient.service';
import { KlienciController } from './klient.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Klient])],
  controllers: [KlienciController],
  providers: [KlienciService],
  exports: [KlienciService],
})
export class KlienciModule {}
