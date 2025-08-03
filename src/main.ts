import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /**set the app to use validators globally */
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const port = 4000;
  await app.listen(port, () => {
    console.log(`app running on port ${port}`);
  });
}
bootstrap();
