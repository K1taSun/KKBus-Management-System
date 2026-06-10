import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, Module, Global, DynamicModule } from '@nestjs/common';
import { AuthModule } from '../../backend/src/modules/auth/auth.module';
import { ReservationsModule } from '../../backend/src/modules/reservations/reservations.module';
import { PublicInfoModule } from '../../backend/src/modules/public-info/public-info.module';
import { DataSource } from '../../backend/node_modules/typeorm';
import { HttpExceptionFilter } from '../../backend/src/common/filters/http-exception.filter';
import { Reflector } from '../../backend/node_modules/@nestjs/core';

let sharedMockDataSource: any;

@Global()
@Module({
  providers: [
    {
      provide: DataSource,
      useFactory: () => sharedMockDataSource,
    },
    {
      provide: Reflector,
      useClass: Reflector,
    },
  ],
  exports: [DataSource, Reflector],
})
class TestDbModule {}

export async function createTestApp(mockDataSource: any): Promise<INestApplication> {
  sharedMockDataSource = mockDataSource;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      TestDbModule,
      AuthModule,
      ReservationsModule,
      PublicInfoModule,
    ],
  })
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api');
  await app.init();
  return app;
}
export const mockQueryRunnerObj = {
  connect: jest.fn().mockResolvedValue(undefined),
  startTransaction: jest.fn().mockResolvedValue(undefined),
  commitTransaction: jest.fn().mockResolvedValue(undefined),
  rollbackTransaction: jest.fn().mockResolvedValue(undefined),
  release: jest.fn().mockResolvedValue(undefined),
  manager: {
    query: jest.fn(),
  },
};

export const mockDataSourceObj = {
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunnerObj),
  query: jest.fn(),
};
