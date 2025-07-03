import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileUploadResponseDto } from './dto/file-upload-response.dto';
import * as path from 'path';

@Injectable()
export class StorageService {
  private storage: Storage;
  private bucketName: string;

  constructor() {
    // Configuración de Google Cloud Storage
    this.storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE, // Ruta al archivo de credenciales JSON
    });
    
    this.bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'videoshop_image_storage_bucket_1';
  }

  /**
   * Sube un archivo a Google Cloud Storage
   */
  async uploadFile(
    file: Express.Multer.File,
    uploadFileDto: UploadFileDto,
  ): Promise<FileUploadResponseDto> {
    try {
      if (!file) {
        throw new BadRequestException('No se proporcionó ningún archivo');
      }

      // Validar el tamaño del archivo (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new BadRequestException('El archivo es demasiado grande. Máximo 10MB permitido');
      }

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const fileExtension = path.extname(file.originalname);
      const fileName = uploadFileDto.fileName || `${timestamp}${fileExtension}`;
      
      // Construir la ruta del archivo
      const folder = uploadFileDto.folder || 'uploads';
      const filePath = `${folder}/${fileName}`;

      // Obtener el bucket
      const bucket = this.storage.bucket(this.bucketName);
      const fileUpload = bucket.file(filePath);

      // Crear el stream de subida
      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: uploadFileDto.contentType || file.mimetype,
          metadata: {
            originalName: file.originalname,
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      return new Promise((resolve, reject) => {
        stream.on('error', (error) => {
          console.error('Error al subir archivo:', error);
          reject(new InternalServerErrorException('Error al subir el archivo'));
        });

        // ...existing code...
        stream.on('finish', async () => {
          try {
            // await fileUpload.makePublic(); // Elimina o comenta esta línea
        
            // Generar URL de descarga
            const downloadUrl = `https://storage.googleapis.com/${this.bucketName}/${filePath}`;
        
            resolve({
              success: true,
              message: 'Archivo subido exitosamente',
              fileName: fileName,
              downloadUrl: downloadUrl,
              fileSize: file.size,
              contentType: file.mimetype,
            });
          } catch (error) {
            console.error('Error al hacer público el archivo:', error);
            reject(new InternalServerErrorException('Error al procesar el archivo'));
          }
        });
        // ...existing code...

        stream.end(file.buffer);
      });
    } catch (error) {
      console.error('Error en uploadFile:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }

  /**
   * Descarga un archivo desde Google Cloud Storage
   */
  async downloadFile(fileName: string, folder: string = 'uploads'): Promise<Buffer> {
    try {
      const filePath = `${folder}/${fileName}`;
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(filePath);

      // Verificar si el archivo existe
      const [exists] = await file.exists();
      if (!exists) {
        throw new BadRequestException('Archivo no encontrado');
      }

      // Descargar el archivo
      const [fileContents] = await file.download();
      return fileContents;
    } catch (error) {
      console.error('Error en downloadFile:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al descargar el archivo');
    }
  }

  /**
   * Elimina un archivo de Google Cloud Storage
   */
  async deleteFile(fileName: string, folder: string = 'uploads'): Promise<{ success: boolean; message: string }> {
    try {
      const filePath = `${folder}/${fileName}`;
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(filePath);

      // Verificar si el archivo existe
      const [exists] = await file.exists();
      if (!exists) {
        throw new BadRequestException('Archivo no encontrado');
      }

      // Eliminar el archivo
      await file.delete();

      return {
        success: true,
        message: 'Archivo eliminado exitosamente',
      };
    } catch (error) {
      console.error('Error en deleteFile:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el archivo');
    }
  }

  /**
   * Lista archivos en una carpeta específica
   */
  async listFiles(folder: string = 'uploads'): Promise<{ files: string[] }> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const [files] = await bucket.getFiles({
        prefix: `${folder}/`,
      });

      const fileNames = files.map(file => file.name.replace(`${folder}/`, ''));

      return {
        files: fileNames,
      };
    } catch (error) {
      console.error('Error en listFiles:', error);
      throw new InternalServerErrorException('Error al listar archivos');
    }
  }

  /**
   * Obtiene información de un archivo
   */
  async getFileInfo(fileName: string, folder: string = 'uploads'): Promise<any> {
    try {
      const filePath = `${folder}/${fileName}`;
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(filePath);

      // Verificar si el archivo existe
      const [exists] = await file.exists();
      if (!exists) {
        throw new BadRequestException('Archivo no encontrado');
      }

      // Obtener metadatos del archivo
      const [metadata] = await file.getMetadata();

      return {
        name: file.name,
        size: metadata.size,
        contentType: metadata.contentType,
        created: metadata.timeCreated,
        updated: metadata.updated,
        downloadUrl: `https://storage.googleapis.com/${this.bucketName}/${filePath}`,
      };
    } catch (error) {
      console.error('Error en getFileInfo:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener información del archivo');
    }
  }
}
