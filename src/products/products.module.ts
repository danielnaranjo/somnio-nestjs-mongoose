import { Module } from '@nestjs/common';
import { ProductsService } from './services/products.service';
import { ProductsController } from './products.controller';
import { DatabaseModule } from 'shared/database/database.module';
import { productsProviders } from './products.providers';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [DatabaseModule, CacheModule.register()],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ...productsProviders,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class ProductsModule {}
