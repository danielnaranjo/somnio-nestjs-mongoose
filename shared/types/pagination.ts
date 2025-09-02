import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';

export interface Pagination {
  filter?: Record<string, any>;
  limit?: number;
  offset?: number;
  sortBy?: string;
  orderBy?: string | number;
}

export class PaginationDto {
  @IsObject()
  @IsOptional()
  filter: object;

  @IsOptional()
  @IsNumber()
  offset: number;

  @IsOptional()
  @IsNumber()
  limit: number;

  @IsString()
  @IsOptional()
  sortBy: string;

  @IsString()
  @IsOptional()
  orderBy: string;
}
