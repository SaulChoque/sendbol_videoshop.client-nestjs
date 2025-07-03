import { Test, TestingModule } from '@nestjs/testing';
import { PlataformasController } from './plataformas.controller';
import { PlataformasService } from './plataformas.service';
import { getModelToken } from '@nestjs/mongoose';

const mockPlataformaModel = {};

describe('PlataformasController', () => {
  let controller: PlataformasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlataformasController],
      providers: [
        PlataformasService,
        { provide: getModelToken('Plataforma'), useValue: mockPlataformaModel },
      ],
    }).compile();

    controller = module.get<PlataformasController>(PlataformasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
