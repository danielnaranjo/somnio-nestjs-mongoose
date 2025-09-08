import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  Query,
  Put,
  Logger,
} from '@nestjs/common';
import { ProductsService } from './services/products.service';
import type { PaginationDto } from 'shared/types/pagination';
import { CreateProductDto, UpdateProductDto } from './dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@UseInterceptors(CacheInterceptor)
@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly productsService: ProductsService) {}
  @Get()
  findAll(@Query() params: PaginationDto) {
    this.logger.log(JSON.stringify(params));
    if (params.filter) {
      const obj = {};
      const values = JSON.stringify(params.filter).split('=');
      obj[values[0]] = values[1];
      params.filter = obj;
    }
    return this.productsService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  create(@Body() createProductDto: CreateProductDto[]) {
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  update(@Param('id') id: any, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }
}
