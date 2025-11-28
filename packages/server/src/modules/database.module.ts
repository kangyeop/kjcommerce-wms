import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'better-sqlite3', // "sqlite" 대신 "better-sqlite3" 사용
        database: 'database.sqlite',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true, // 자동 스키마 동기화 활성화
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
  ],
})
export class DatabaseModule {}
