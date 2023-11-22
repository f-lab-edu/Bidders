import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerService } from '@libs/swagger';
import { API_SWAGGER_OPTIONS } from '@libs/swagger/constants/swagger.constant';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    /* SWAGGER SETUP */
    const swaggerService = app.get(SwaggerService);
    swaggerService.setup(app, API_SWAGGER_OPTIONS);

    await app.listen(configService.get('PORT') || 3000);
}
bootstrap();
