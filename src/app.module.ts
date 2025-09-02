import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register(),
    MongooseModule.forRoot(process.env.MONGODB_URI ?? ''),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
