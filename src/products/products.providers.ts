import { Mongoose } from 'mongoose';
import { ProductsSchema } from '../products/schemas/products.schema';

export const productsProviders = [
  {
    provide: 'PRODUCTS_MODEL',
    useFactory: (mongoose: Mongoose) =>
      mongoose.model('Products', ProductsSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
