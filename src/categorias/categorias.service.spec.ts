import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasService } from './categorias.service';
import { getModelToken } from '@nestjs/mongoose';

// Mock para el modelo de Mongoose
const mockCategoriaModel = {
  find: jest.fn().mockReturnThis(),
  findById: jest.fn().mockReturnThis(),
  findByIdAndUpdate: jest.fn().mockReturnThis(),
  findByIdAndDelete: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([]),
  save: jest.fn(),
};
const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

describe('CategoriasService', () => {
  let service: CategoriasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriasService,
        { provide: getModelToken('Categoria'), useValue: mockCategoriaModel },
        { provide: 'default_IORedisModuleConnectionToken', useValue: mockRedisClient },
      ],
    }).compile();

    service = module.get<CategoriasService>(CategoriasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
