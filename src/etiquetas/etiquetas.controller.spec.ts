import { Test, TestingModule } from '@nestjs/testing';
import { EtiquetasController } from './etiquetas.controller';
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

describe('EtiquetasController', () => {
  let controller: EtiquetasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EtiquetasController],
      providers: [
        EtiquetasService,
        { provide: getModelToken('Etiqueta'), useValue: mockEtiquetaModel },
        { provide: 'default_IORedisModuleConnectionToken', useValue: mockRedisClient },
      ],
    }).compile();

    controller = module.get<EtiquetasController>(EtiquetasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
