import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasController } from './categorias.controller';
import { CategoriasService } from './categorias.service';
import { getModelToken } from '@nestjs/mongoose';

// Mock para el modelo de Mongoose
const mockCategoriaModel = {};
// Mock para el cliente Redis
const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

describe('CategoriasController', () => {
  let controller: CategoriasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriasController],
      providers: [
        CategoriasService,
        { provide: getModelToken('Categoria'), useValue: mockCategoriaModel },
        { provide: 'default_IORedisModuleConnectionToken', useValue: mockRedisClient },
      ],
    }).compile();

    controller = module.get<CategoriasController>(CategoriasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
