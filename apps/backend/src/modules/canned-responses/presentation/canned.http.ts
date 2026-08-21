import type { CannedResponse } from '../domain/canned-response';

const VARIABLE_HINTS: Record<string, string> = {
  nome_cliente: 'preenchido com o nome cadastrado do cliente',
  agente: 'nome do agente atual',
  prazo_reembolso: 'prazo padrão da política financeira',
  tempo_expiracao: 'política de segurança',
  categoria: 'categoria do chamado',
};

export type CannedResponseHttp = {
  id: string;
  title: string;
  category: string;
  shortcut: string;
  body: string;
  useCount: number;
  meta: string;
  variables: string[];
  variableHints: string[];
  createdAt: string;
  updatedAt: string;
};

export function toCannedResponseHttp(
  response: CannedResponse,
): CannedResponseHttp {
  const variables = response.variables;
  return {
    id: response.id,
    title: response.title,
    category: response.category,
    shortcut: response.shortcut,
    body: response.body,
    useCount: response.useCount,
    meta: `${response.category} · usado ${response.useCount} vezes`,
    variables,
    variableHints:
      variables.length === 0
        ? ['nenhuma variável usada neste modelo']
        : variables.map((name) => {
            const hint = VARIABLE_HINTS[name];
            return hint
              ? `{{${name}}} — ${hint}`
              : `{{${name}}} — variável do modelo`;
          }),
    createdAt: response.createdAt.toISOString(),
    updatedAt: response.updatedAt.toISOString(),
  };
}
