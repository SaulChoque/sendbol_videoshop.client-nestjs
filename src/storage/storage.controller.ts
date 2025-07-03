import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Body,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { StorageService } from './storage.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileUploadResponseDto } from './dto/file-upload-response.dto';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Endpoint para subir archivos
   * POST /storage/upload
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
  ): Promise<FileUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    return await this.storageService.uploadFile(file, uploadFileDto);
  }

  /**
   * Endpoint para descargar archivos
   * GET /storage/download/:fileName
   */
  @Get('download/:fileName')
  async downloadFile(
    @Param('fileName') fileName: string,
    @Query('folder') folder: string = 'uploads',
    @Res() res: Response,
  ): Promise<void> {
    try {
      const fileBuffer = await this.storageService.downloadFile(fileName, folder);
      
      // Obtener información del archivo para establecer headers apropiados
      const fileInfo = await this.storageService.getFileInfo(fileName, folder);
      
      res.set({
        'Content-Type': fileInfo.contentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      });

      res.send(fileBuffer);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Endpoint para eliminar archivos
   * DELETE /storage/delete/:fileName
   */
  @Delete('delete/:fileName')
  async deleteFile(
    @Param('fileName') fileName: string,
    @Query('folder') folder: string = 'uploads',
  ): Promise<{ success: boolean; message: string }> {
    return await this.storageService.deleteFile(fileName, folder);
  }

  /**
   * Endpoint para listar archivos en una carpeta
   * GET /storage/list
   */
  @Get('list')
  async listFiles(
    @Query('folder') folder: string = 'uploads',
  ): Promise<{ files: string[] }> {
    return await this.storageService.listFiles(folder);
  }

  /**
   * Endpoint para obtener información de un archivo
   * GET /storage/info/:fileName
   */
  @Get('info/:fileName')
  async getFileInfo(
    @Param('fileName') fileName: string,
    @Query('folder') folder: string = 'uploads',
  ): Promise<any> {
    return await this.storageService.getFileInfo(fileName, folder);
  }

  /**
   * Endpoint para obtener URL de descarga directa
   * GET /storage/url/:fileName
   */
  @Get('url/:fileName')
  async getDownloadUrl(
    @Param('fileName') fileName: string,
    @Query('folder') folder: string = 'uploads',
  ): Promise<{ downloadUrl: string }> {
    const fileInfo = await this.storageService.getFileInfo(fileName, folder);
    return { downloadUrl: fileInfo.downloadUrl };
  }

  /**
   * Endpoint para verificar si un archivo existe
   * GET /storage/exists/:fileName
   */
  @Get('exists/:fileName')
  async fileExists(
    @Param('fileName') fileName: string,
    @Query('folder') folder: string = 'uploads',
  ): Promise<{ exists: boolean }> {
    try {
      await this.storageService.getFileInfo(fileName, folder);
      return { exists: true };
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return { exists: false };
      }
      throw error;
    }
  }
}
