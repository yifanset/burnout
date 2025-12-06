import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";

async function bootstrap() {
    const PORT = process.env.PORT || 8080;

    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');

    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true,
    }));

    app.enableCors();

    await app.listen(PORT, '0.0.0.0', () => console.log(`In development: Listening on http://localhost:${PORT}`));
}
bootstrap();
