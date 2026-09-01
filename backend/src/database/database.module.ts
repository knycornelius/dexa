import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'dexa_attendance'),
        // Every entity registered via TypeOrmModule.forFeature([...]) in any
        // module gets picked up automatically — no manual entities[] glob to
        // keep in sync as Users/Attendance modules get added in later phases.
        autoLoadEntities: true,
        // Dev convenience only: auto-syncs the schema from entities.
        // Swap for real migrations before this touches anything like production.
        synchronize: true,
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
