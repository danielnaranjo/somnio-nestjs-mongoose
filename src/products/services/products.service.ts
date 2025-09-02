import { Inject, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { Product } from '../entities/product.entity';
import { Pagination } from 'shared/types/pagination';
import { CreateProductDto } from '../dto';
@Injectable()
export class ProductsService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject('PRODUCTS_MODEL') private readonly productsModel: Model<Product>,
  ) {}

  async findAll(options: Pagination) {
    this.logger.log(options);
    const refreshData = await this.productsModel
      .find(options.filter || {})
      .skip(Number(options.offset) || 0)
      .limit(Number(options.limit) || 10)
      .sort(
        options.sortBy
          ? {
              [options.sortBy]:
                options.orderBy === 'desc' || options.orderBy === -1 ? -1 : 1,
            }
          : {},
      )
      .exec();
    return refreshData;
  }

  async findOne(id: string) {
    this.logger.log(id);
    return await this.productsModel.findById(id).exec();
  }

  create(createProductDto: CreateProductDto[]) {
    this.logger.log(createProductDto.length);
    return this.productsModel.insertMany(createProductDto);
  }
}
