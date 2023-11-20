import { DataSource } from 'typeorm';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    entities: [path.join(__dirname, '../../', 'entity', '**', '*.entity.ts')],
    migrations: [path.join(__dirname, '../../../', 'mysql-migrations', '*.ts')],
    migrationsTableName: 'migrations',
});
