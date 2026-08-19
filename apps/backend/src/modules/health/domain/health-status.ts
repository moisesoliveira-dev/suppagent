export type HealthStatus = {
  status: 'ok' | 'error';
  database: 'up' | 'down';
};
