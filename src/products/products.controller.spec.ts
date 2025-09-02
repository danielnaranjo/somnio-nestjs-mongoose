/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './services/products.service';
import { CacheModule } from '@nestjs/cache-manager';
import { DatabaseModule } from '../../shared/database/database.module';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, CacheModule.register()],
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            findAll: jest
              .fn()
              .mockReturnValue([{ id: '1' }, { id: '2' }, { id: '3' }]),
            findOne: jest.fn().mockReturnValue({ id: '1' }),
            create: jest.fn().mockReturnValue({ id: '4' }),
          },
        },
        {
          provide: 'PRODUCTS_MODEL',
          useValue: {},
        },
        {
          provide: 'DATABASE_CONNECTION',
          useValue: {},
        },
        {
          provide: 'CACHE_MANAGER',
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findAll method', async () => {
    await controller.findAll({
      filter: {},
      offset: 0,
      limit: 0,
      sortBy: '',
      orderBy: '',
    });
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should call findOne method', async () => {
    await controller.findOne('2');
    expect(service.findOne).toHaveBeenCalled();
    expect(service.findOne).toHaveBeenCalledWith('2');
  });

  it('should call create method', async () => {
    await controller.create([
      {
        name: 'Product 1',
        description: 'Description 1',
        price: 10,
        category: 'Category 1',
        sku: 'SKU1',
      },
    ]);
    expect(service.create).toHaveBeenCalled();
    expect(service.create).not.toBeFalsy();
  });
});
