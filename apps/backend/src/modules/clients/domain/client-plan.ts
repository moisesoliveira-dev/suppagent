export type ClientPlan = 'starter' | 'pro' | 'empresa';

const PLAN_ALIASES: Record<string, ClientPlan> = {
  starter: 'starter',
  pro: 'pro',
  empresa: 'empresa',
};

export class InvalidClientPlanError extends Error {
  constructor(value: string) {
    super(`plano inválido: ${value}`);
    this.name = 'InvalidClientPlanError';
  }
}

export function parseClientPlan(raw: string): ClientPlan {
  const key = raw.trim().toLowerCase();
  const plan = PLAN_ALIASES[key];
  if (!plan) throw new InvalidClientPlanError(raw);
  return plan;
}

export const CLIENT_PLAN_LABELS: Record<ClientPlan, string> = {
  starter: 'starter',
  pro: 'pro',
  empresa: 'empresa',
};
