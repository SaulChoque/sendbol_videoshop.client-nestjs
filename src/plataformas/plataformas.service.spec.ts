import { Test, TestingModule } from '@nestjs/testing';
import { PlataformasService } from './plataformas.service';
import { getModelToken } from '@nestjs/mongoose';

const mockPlataformaModel = {
  find: jest.fn().mockReturnThis(),
  findById: jest.fn().mockReturnThis(),
  findByIdAndUpdate: jest.fn().mockReturnThis(),
  findByIdAndDelete: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([]),
  save: jest.fn(),
};

describe('PlataformasService', () => {
  let service: PlataformasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlataformasService,
        { provide: getModelToken('Plataforma'), useValue: mockPlataformaModel },
      ],
    }).compile();

    service = module.get<PlataformasService>(PlataformasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
