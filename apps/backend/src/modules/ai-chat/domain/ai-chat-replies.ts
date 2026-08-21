const Canned: Record<string, string> = {
  'qual o sla da categoria financeiro?':
    'A política de SLA para financeiro segue a prioridade: urgente (15min / 4h), alta (30min / 8h), média (2h / 24h) e baixa (8h / 72h).',
  'resuma o histórico da marina costa':
    'Marina Costa é cliente do plano Empresa desde março de 2023, com 7 chamados. Tem 1 aberto agora (#4471, urgente).',
  'como funciona o roteamento automático?':
    'A IA analisa o texto e o histórico. Confiança ≥ 80% aplica o roteamento; abaixo disso vai para revisão humana.',
  'o que é uma resposta de baixa confiança?':
    'É quando a similaridade fica abaixo de ~70%. A IA sugere a resposta, mas espera aprovação humana.',
  'quantos chamados urgentes estão em aberto agora?':
    'Há <b>6 chamados urgentes</b> em aberto agora. Três deles (#4471, #4448 e #4441) já estão vencidos ou muito próximos do prazo.',
};

export const AI_CHAT_STARTERS = Object.keys(Canned).filter(
  (key) => key !== 'quantos chamados urgentes estão em aberto agora?',
);

export function replyToPrompt(text: string): string {
  const key = text.trim().toLowerCase();
  return (
    Canned[key] ??
    'Deixa eu verificar isso na base de chamados… (resposta simulada neste protótipo.)'
  );
}
