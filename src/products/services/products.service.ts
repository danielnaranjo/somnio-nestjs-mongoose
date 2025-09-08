import { Inject, Injectable, Logger } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Product } from '../entities/product.entity';
import { Pagination } from 'shared/types/pagination';
import { CreateProductDto, UpdateProductDto } from '../dto';
@Injectable()
export class ProductsService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject('PRODUCTS_MODEL') private readonly productsModel: Model<Product>,
  ) {}

  async findAll(options: Pagination) {
    this.logger.log(JSON.stringify(options));
    const refreshData = await this.productsModel
      .find(options.filter || {})
      .skip(Number(options.offset) || 1)
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
    return {
      total: await this.productsModel
        .countDocuments(options.filter || {})
        .exec(),
      results: refreshData,
    };
  }

  async findOne(id: string) {
    this.logger.log(id);
    return await this.productsModel.findById(id).exec();
  }

  async create(createProductDto: CreateProductDto[]) {
    this.logger.log(createProductDto.length);
    return await this.productsModel.insertMany(createProductDto);
  }

  async update(id: any, updateProductDto: UpdateProductDto) {
    this.logger.log(id, updateProductDto);
    return await this.productsModel.updateOne(
      { _id: new Types.ObjectId('id') },
      updateProductDto,
    );
  }
}
