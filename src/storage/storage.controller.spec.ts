import { Test, TestingModule } from '@nestjs/testing';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { BadRequestException } from '@nestjs/common';

describe('StorageController', () => {
  let controller: StorageController;
  let service: StorageService;

  const mockStorageService = {
    uploadFile: jest.fn(),
    downloadFile: jest.fn(),
    deleteFile: jest.fn(),
    listFiles: jest.fn(),
    getFileInfo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    controller = module.get<StorageController>(StorageController);
    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      const uploadDto = {
        fileName: 'test-file',
        folder: 'test',
      };

      const expectedResponse = {
        success: true,
        message: 'Archivo subido exitosamente',
        fileName: 'test-file.jpg',
        downloadUrl: 'https://storage.googleapis.com/bucket/test/test-file.jpg',
        fileSize: 1024,
        contentType: 'image/jpeg',
      };

      mockStorageService.uploadFile.mockResolvedValue(expectedResponse);

      const result = await controller.uploadFile(mockFile, uploadDto);

      expect(result).toEqual(expectedResponse);
      expect(service.uploadFile).toHaveBeenCalledWith(mockFile, uploadDto);
    });

    it('should throw BadRequestException when no file provided', async () => {
      const uploadDto = { fileName: 'test' };

      await expect(controller.uploadFile(null as any, uploadDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const fileName = 'test-file.jpg';
      const folder = 'test';
      const expectedResponse = {
        success: true,
        message: 'Archivo eliminado exitosamente',
      };

      mockStorageService.deleteFile.mockResolvedValue(expectedResponse);

      const result = await controller.deleteFile(fileName, folder);

      expect(result).toEqual(expectedResponse);
      expect(service.deleteFile).toHaveBeenCalledWith(fileName, folder);
    });
  });

  describe('listFiles', () => {
    it('should list files successfully', async () => {
      const folder = 'test';
      const expectedResponse = {
        files: ['file1.jpg', 'file2.pdf'],
      };

      mockStorageService.listFiles.mockResolvedValue(expectedResponse);

      const result = await controller.listFiles(folder);

      expect(result).toEqual(expectedResponse);
      expect(service.listFiles).toHaveBeenCalledWith(folder);
    });
  });

  describe('getFileInfo', () => {
    it('should get file info successfully', async () => {
      const fileName = 'test-file.jpg';
      const folder = 'test';
      const expectedResponse = {
        name: 'test/test-file.jpg',
        size: '1024',
        contentType: 'image/jpeg',
        created: '2024-01-15T10:30:00Z',
        updated: '2024-01-15T10:30:00Z',
        downloadUrl: 'https://storage.googleapis.com/bucket/test/test-file.jpg',
      };

      mockStorageService.getFileInfo.mockResolvedValue(expectedResponse);

      const result = await controller.getFileInfo(fileName, folder);

      expect(result).toEqual(expectedResponse);
      expect(service.getFileInfo).toHaveBeenCalledWith(fileName, folder);
    });
  });

  describe('getDownloadUrl', () => {
    it('should get download URL successfully', async () => {
      const fileName = 'test-file.jpg';
      const folder = 'test';
      const fileInfo = {
        downloadUrl: 'https://storage.googleapis.com/bucket/test/test-file.jpg',
      };

      mockStorageService.getFileInfo.mockResolvedValue(fileInfo);

      const result = await controller.getDownloadUrl(fileName, folder);

      expect(result).toEqual({ downloadUrl: fileInfo.downloadUrl });
      expect(service.getFileInfo).toHaveBeenCalledWith(fileName, folder);
    });
  });

  describe('fileExists', () => {
    it('should return true when file exists', async () => {
      const fileName = 'test-file.jpg';
      const folder = 'test';

      mockStorageService.getFileInfo.mockResolvedValue({});

      const result = await controller.fileExists(fileName, folder);

      expect(result).toEqual({ exists: true });
      expect(service.getFileInfo).toHaveBeenCalledWith(fileName, folder);
    });

    it('should return false when file does not exist', async () => {
      const fileName = 'test-file.jpg';
      const folder = 'test';

      mockStorageService.getFileInfo.mockRejectedValue(
        new Error('Archivo no encontrado'),
      );

      const result = await controller.fileExists(fileName, folder);

      expect(result).toEqual({ exists: false });
      expect(service.getFileInfo).toHaveBeenCalledWith(fileName, folder);
    });
  });
});
