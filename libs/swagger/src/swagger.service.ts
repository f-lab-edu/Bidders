import { INestApplication, Injectable } from '@nestjs/common';
import { ISwaggerOptions } from './interfaces/swagger.interface';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

@Injectable()
export class SwaggerService {
    setup(app: INestApplication, swaggerOptions: ISwaggerOptions) {
        const options = new DocumentBuilder()
            .setTitle(swaggerOptions.title)
            .setDescription(swaggerOptions.description)
            .setVersion(swaggerOptions.version)
            .addBearerAuth(
                {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    in: 'header',
                },
                'bearerAuth',
            )
            .build();
        const document = SwaggerModule.createDocument(app, options);

        SwaggerModule.setup(swaggerOptions.root, app, document);
    }
}
