import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './services/products.service';
import type { PaginationDto } from 'shared/types/pagination';
import { CreateProductDto } from './dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@UseInterceptors(CacheInterceptor)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Get()
  findAll(@Param() params: PaginationDto) {
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
}
