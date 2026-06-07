import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Controller, Patch, Param, UseInterceptors } from '@nestjs/common';
import * as request from 'supertest';
import { AuditLogInterceptor } from '../interceptors/audit-log.interceptor';

@Controller('owner')
class MockOwnerController {
  @Patch('routes/:id/deactivate')
  @UseInterceptors(AuditLogInterceptor)
  deactivateRoute(@Param('id') id: string) {
    return { id, is_active: false };
  }
}

describe('AuditLogInterceptor (e2e)', () => {
  let app: INestApplication;
  const mockPool = {
    query: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MockOwnerController],
      providers: [
        {
          provide: 'DATABASE_POOL',
          useValue: mockPool,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Mock global user for request
    app.use((req, res, next) => {
      req.user = { sub: 'wlasciciel-uuid' };
      next();
    });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('/owner/routes/:id/deactivate (PATCH) - should log audit action', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app.getHttpServer())
      .patch('/owner/routes/123/deactivate')
      .send({ reason: 'Seasonal closure' })
      .expect(200);

    expect(response.body).toEqual({ id: '123', is_active: false });

    // Ensure the interceptor correctly extracted req.user and req.body to save into DB
    expect(mockPool.query).toHaveBeenCalledTimes(1);
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO system_logs'),
      [
        'wlasciciel-uuid',
        'PATCH',
        '/owner/routes/123/deactivate',
        JSON.stringify({ reason: 'Seasonal closure' }),
      ]
    );
  });
});
