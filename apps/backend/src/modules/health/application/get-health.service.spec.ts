import { Test, TestingModule } from '@nestjs/testing';
import { GetHealthService } from './get-health.service';
import { HEALTH_PORT } from '../domain/health.port';

describe('GetHealthService', () => {
  let service: GetHealthService;
  let ping: jest.Mock;

  beforeEach(async () => {
    ping = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetHealthService,
        { provide: HEALTH_PORT, useValue: { ping } },
      ],
    }).compile();

    service = module.get(GetHealthService);
  });

  it('retorna ok quando o banco responde', async () => {
    ping.mockResolvedValue(undefined);
    await expect(service.execute()).resolves.toEqual({
      status: 'ok',
      database: 'up',
    });
  });

  it('retorna error quando o banco falha', async () => {
    ping.mockRejectedValue(new Error('down'));
    await expect(service.execute()).resolves.toEqual({
      status: 'error',
      database: 'down',
    });
  });
});
