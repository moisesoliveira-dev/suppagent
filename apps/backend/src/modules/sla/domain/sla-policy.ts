export type SlaPriority = 'urgent' | 'high' | 'medium' | 'low';

export type SlaTone = 'ok' | 'warn' | 'breach';

export type SlaClock = {
  tone: SlaTone;
  shortLabel: string;
  detailText: string;
  detailSub: string;
  dueAt: Date | null;
  metAt: Date | null;
  targetMinutes: number;
};

export type SlaPolicyProps = {
  id: string;
  priority: SlaPriority;
  responseMinutes: number;
  resolutionMinutes: number;
  createdAt: Date;
  updatedAt: Date;
};

export class SlaPolicy {
  private constructor(
    private readonly _id: string,
    private readonly _priority: SlaPriority,
    private _responseMinutes: number,
    private _resolutionMinutes: number,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static reconstitute(props: SlaPolicyProps): SlaPolicy {
    return new SlaPolicy(
      props.id,
      props.priority,
      props.responseMinutes,
      props.resolutionMinutes,
      props.createdAt,
      props.updatedAt,
    );
  }

  get id() {
    return this._id;
  }
  get priority() {
    return this._priority;
  }
  get responseMinutes() {
    return this._responseMinutes;
  }
  get resolutionMinutes() {
    return this._resolutionMinutes;
  }
  get createdAt() {
    return this._createdAt;
  }
  get updatedAt() {
    return this._updatedAt;
  }

  updateTargets(input: {
    responseMinutes: number;
    resolutionMinutes: number;
  }) {
    if (!Number.isFinite(input.responseMinutes) || input.responseMinutes < 1) {
      throw new Error('prazo de resposta deve ser pelo menos 1 minuto');
    }
    if (
      !Number.isFinite(input.resolutionMinutes) ||
      input.resolutionMinutes < 1
    ) {
      throw new Error('prazo de resolução deve ser pelo menos 1 minuto');
    }
    if (input.resolutionMinutes < input.responseMinutes) {
      throw new Error(
        'prazo de resolução deve ser maior ou igual ao de resposta',
      );
    }
    this._responseMinutes = Math.round(input.responseMinutes);
    this._resolutionMinutes = Math.round(input.resolutionMinutes);
    this._updatedAt = new Date();
  }
}
