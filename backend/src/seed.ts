import { ConflictException } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { UserRole } from './users/entities/user.entity.js';
import { UsersService } from './users/users.service.js';

const SEED_USERS = [
  { email: 'admin@test.com', password: 'test1234', name: 'Test Admin', role: UserRole.ADMIN },
  { email: 'employee@test.com', password: 'test1234', name: 'Test Employee', role: UserRole.EMPLOYEE },
];

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  for (const seedUser of SEED_USERS) {
    try {
      await usersService.create(seedUser);
      console.log(`Created ${seedUser.email}`);
    } catch (error) {
      if (error instanceof ConflictException) {
        console.log(`Skipped ${seedUser.email} — already exists`);
      } else {
        throw error;
      }
    }
  }

  await app.close();
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
