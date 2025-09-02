import { IsNumber, IsString } from 'class-validator';
export class Product {
  @IsString()
  id: number;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsString()
  category: string;

  @IsString()
  sku: string;
}
