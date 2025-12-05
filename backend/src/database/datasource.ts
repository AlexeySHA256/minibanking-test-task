import { ConfigService } from '@nestjs/config';
import path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get('POSTGRES_HOST', 'postgres'),
  port: configService.get('POSTGRES_PORT', 5432),
  username: configService.get('POSTGRES_USER'),
  password: configService.get('POSTGRES_PASSWORD'),
  database: configService.get('POSTGRES_DB'),
  entities: [path.join(__dirname, '..', 'entities', '*.entity.{ts,js}')],
  migrations: [path.join(__dirname, '..', '..', 'migrations', '*.{ts,js}')],
  synchronize: process.env.NODE_ENV !== 'production',
  schema: 'public'
};

export const dataSource = new DataSource(dataSourceOptions)
