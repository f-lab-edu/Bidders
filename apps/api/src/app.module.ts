import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MySqlTypeOrmConfigService } from '@libs/type-orm-config';
import { SwaggerModule } from '@libs/swagger';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            useClass: MySqlTypeOrmConfigService,
        }),
        SwaggerModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
