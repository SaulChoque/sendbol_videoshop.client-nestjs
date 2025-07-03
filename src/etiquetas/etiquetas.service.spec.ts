import { Test, TestingModule } from '@nestjs/testing';
import { EtiquetasService } from './etiquetas.service';
import { getModelToken } from '@nestjs/mongoose';

const mockEtiquetaModel = {
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

describe('EtiquetasService', () => {
  let service: EtiquetasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EtiquetasService,
        { provide: getModelToken('Etiqueta'), useValue: mockEtiquetaModel },
        { provide: 'default_IORedisModuleConnectionToken', useValue: mockRedisClient },
      ],
    }).compile();

    service = module.get<EtiquetasService>(EtiquetasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
