import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Res,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { restauracjaObraz } from './restauracjaObraz.entity';
import { RestauracjaObrazService } from './restauracjaObraz.service';

@Controller('restauracja/:restauracjaId/obraz')
export class RestauracjaObrazController {
  constructor(private readonly obrazService: RestauracjaObrazService) {}

  @Post()
  @UseInterceptors(FileInterceptor('obraz'))
  async dodajObraz(
    @Param('restauracjaId') restauracjaId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|gif|webp)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<restauracjaObraz> {
    return this.obrazService.dodajObraz(+restauracjaId, file);
  }

  @Put(':obrazId')
  @UseInterceptors(FileInterceptor('obraz'))
  async zaktualizujObraz(
    @Param('obrazId') obrazId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|gif|webp)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<restauracjaObraz> {
    return this.obrazService.zaktualizujObraz(+obrazId, file);
  }

  @Delete(':obrazId')
  async usunObraz(@Param('obrazId') obrazId: string): Promise<{ message: string }> {
    await this.obrazService.usunObraz(+obrazId);
    return { message: 'Obraz został usunięty' };
  }
}