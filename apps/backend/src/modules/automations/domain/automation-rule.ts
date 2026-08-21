import { randomUUID } from 'node:crypto';

export class AutomationRule {
  private constructor(
    private readonly _id: string,
    private _name: string,
    private _trigger: string,
    private _condition: string,
    private _action: string,
    private _enabled: boolean,
    private readonly _authorName: string,
    private _runCount: number,
    private _lastRunAt: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(input: {
    name: string;
    trigger: string;
    condition: string;
    action: string;
    authorName: string;
    enabled?: boolean;
    now?: Date;
  }): AutomationRule {
    const name = input.name.trim();
    const trigger = input.trigger.trim();
    const condition = input.condition.trim();
    const action = input.action.trim();
    const authorName = input.authorName.trim();
    if (!name) throw new Error('nome da regra é obrigatório');
    if (!trigger) throw new Error('gatilho é obrigatório');
    if (!condition) throw new Error('condição é obrigatória');
    if (!action) throw new Error('ação é obrigatória');
    if (!authorName) throw new Error('autor é obrigatório');
    const now = input.now ?? new Date();
    return new AutomationRule(
      randomUUID(),
      name,
      trigger,
      condition,
      action,
      input.enabled ?? true,
      authorName,
      0,
      null,
      now,
      now,
    );
  }

  static reconstitute(props: {
    id: string;
    name: string;
    trigger: string;
    condition: string;
    action: string;
    enabled: boolean;
    authorName: string;
    runCount: number;
    lastRunAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): AutomationRule {
    return new AutomationRule(
      props.id,
      props.name,
      props.trigger,
      props.condition,
      props.action,
      props.enabled,
      props.authorName,
      props.runCount,
      props.lastRunAt,
      props.createdAt,
      props.updatedAt,
    );
  }

  get id() {
    return this._id;
  }
  get name() {
    return this._name;
  }
  get trigger() {
    return this._trigger;
  }
  get condition() {
    return this._condition;
  }
  get action() {
    return this._action;
  }
  get enabled() {
    return this._enabled;
  }
  get authorName() {
    return this._authorName;
  }
  get runCount() {
    return this._runCount;
  }
  get lastRunAt() {
    return this._lastRunAt;
  }
  get createdAt() {
    return this._createdAt;
  }
  get updatedAt() {
    return this._updatedAt;
  }

  update(input: {
    name?: string;
    trigger?: string;
    condition?: string;
    action?: string;
    enabled?: boolean;
  }) {
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new Error('nome da regra é obrigatório');
      this._name = name;
    }
    if (input.trigger !== undefined) {
      const trigger = input.trigger.trim();
      if (!trigger) throw new Error('gatilho é obrigatório');
      this._trigger = trigger;
    }
    if (input.condition !== undefined) {
      const condition = input.condition.trim();
      if (!condition) throw new Error('condição é obrigatória');
      this._condition = condition;
    }
    if (input.action !== undefined) {
      const action = input.action.trim();
      if (!action) throw new Error('ação é obrigatória');
      this._action = action;
    }
    if (input.enabled !== undefined) this._enabled = input.enabled;
    this._updatedAt = new Date();
  }

  toggle() {
    this._enabled = !this._enabled;
    this._updatedAt = new Date();
  }

  markRun(at = new Date()) {
    this._runCount += 1;
    this._lastRunAt = at;
    this._updatedAt = at;
  }
}
