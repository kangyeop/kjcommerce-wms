import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USER', 'kjuser'),
        password: configService.get<string>('DB_PASSWORD', 'kjpassword'),
        database: configService.get<string>('DB_NAME', 'kjcommerce'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', true),
        logging: configService.get<string>('NODE_ENV') === 'development',
        charset: 'utf8mb4',
        timezone: '+09:00', // 한국 시간대 설정
      }),
    }),
  ],
})
export class DatabaseModule {}