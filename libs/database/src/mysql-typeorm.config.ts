import { DataSource, DataSourceOptions } from 'typeorm';
import path from 'path';
import dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

dotenv.config(); // .env 파일에서 정의된 환경 변수들을 process.env 객체에 추가
const configService = new ConfigService(); // process.env에서 환경 변수 조회

export function dataSourceConfig(configService: ConfigService) {
    const options: TypeOrmModuleOptions = {
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        synchronize: false,
        logging: configService.get<string>('NODE_ENV') === 'development',
        entities: [
            path.join(__dirname, '../../../', 'apps', '**', '*.entity.{ts,js}'),
        ],
        migrations: [
            path.join(__dirname, '../../../', 'mysql-migrations', '*.{ts,js}'),
        ],
        migrationsTableName: 'migrations',
    };
    return options;
}

export const AppDataSource = new DataSource(
    dataSourceConfig(configService) as DataSourceOptions,
);
