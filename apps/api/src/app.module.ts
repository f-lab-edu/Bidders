import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SwaggerModule } from '@libs/swagger';
import { dataSourceConfig } from '@libs/database';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            useFactory: dataSourceConfig,
            inject: [ConfigService],
        }),
        SwaggerModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
