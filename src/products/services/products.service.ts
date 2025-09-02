import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Product } from '../entities/product.entity';
//import { CreateProductDto, UpdateProductDto } from '../dto';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('PRODUCTS_MODEL') private readonly productsModel: Model<Product>,
  ) {}

  findAll() {
    return this.productsModel.find().exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  /*   create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  } */

  /*   update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  } */
}
