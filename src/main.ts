import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: '*' },
  });
  const port = process.env.PORT || 3000;
  app.use(cors());
  await app.listen(port).then(() => {
    console.log(`Gateway service is running on http://localhost:${port}`);
  });
}
bootstrap();
