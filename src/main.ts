import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConsoleLogger } from '@nestjs/common';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    abortOnError: false,
    logger: new ConsoleLogger({
      prefix: 'API',
      colors: true,
    }),
  });
  app.setGlobalPrefix('api');
  app.use(helmet());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Products API')
    .setDescription('The Products API')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
bootstrap().catch((err: any) => console.error(err.message));
