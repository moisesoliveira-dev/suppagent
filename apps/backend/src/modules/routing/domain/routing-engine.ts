export type RoutingTone = 'high' | 'mid' | 'low';
export type RoutingStatus = 'aplicado' | 'pendente' | 'revisao';

export type RoutingSuggestion = {
  ruleId: string | null;
  ruleName: string | null;
  category: string;
  agentHandle: string | null;
  confidence: number;
  tone: RoutingTone;
  status: RoutingStatus;
  matchedKeywords: string[];
  signals: string[];
};

export type RoutingTicketInput = {
  id: number;
  subject: string;
  category: string;
  agentId: string | null;
  requesterName: string;
  requesterEmail: string;
  textBlob: string;
  priorByCategory: Record<string, number>;
};

export type RoutingRuleInput = {
  id: string;
  name: string;
  keywords: string[];
  category: string;
  agentHandle: string | null;
  enabled: boolean;
};

const REVIEW_THRESHOLD = 70;
const HIGH_THRESHOLD = 85;

export function matchKeywords(
  text: string,
  keywords: string[],
): string[] {
  const haystack = text.toLowerCase();
  return keywords.filter((keyword) => haystack.includes(keyword.toLowerCase()));
}

export function confidenceFromMatch(input: {
  matchedCount: number;
  priorCategoryCount: number;
  hasAgent: boolean;
}): number {
  let score = 50 + input.matchedCount * 15;
  if (input.priorCategoryCount > 0) score += 10;
  if (!input.hasAgent) score -= 15;
  return Math.max(40, Math.min(98, score));
}

export function toneFromConfidence(confidence: number): RoutingTone {
  if (confidence >= HIGH_THRESHOLD) return 'high';
  if (confidence >= REVIEW_THRESHOLD) return 'mid';
  return 'low';
}

export function suggestRouting(
  ticket: RoutingTicketInput,
  rules: RoutingRuleInput[],
  agentNames: Record<string, string>,
): RoutingSuggestion {
  const enabled = rules.filter((rule) => rule.enabled);
  let best: {
    rule: RoutingRuleInput;
    matched: string[];
  } | null = null;

  for (const rule of enabled) {
    const matched = matchKeywords(ticket.textBlob, rule.keywords);
    if (matched.length === 0) continue;
    if (!best || matched.length > best.matched.length) {
      best = { rule, matched };
    }
  }

  if (!best) {
    const prior = ticket.priorByCategory[ticket.category.toLowerCase()] ?? 0;
    return {
      ruleId: null,
      ruleName: null,
      category: 'indefinido',
      agentHandle: null,
      confidence: 55,
      tone: 'low',
      status: resolveStatus({
        ticket,
        category: 'indefinido',
        agentHandle: null,
        confidence: 55,
      }),
      matchedKeywords: [],
      signals: [
        'nenhuma palavra-chave de regra correspondente',
        prior > 0
          ? `cliente com ${prior} chamado(s) na categoria atual`
          : 'cliente sem histórico anterior de chamados',
      ],
    };
  }

  const priorCategoryCount =
    ticket.priorByCategory[best.rule.category.toLowerCase()] ?? 0;
  const confidence = confidenceFromMatch({
    matchedCount: best.matched.length,
    priorCategoryCount,
    hasAgent: Boolean(best.rule.agentHandle),
  });
  const category = best.rule.category;
  const agentHandle = best.rule.agentHandle;
  const agentLabel = agentHandle
    ? (agentNames[agentHandle] ?? agentHandle)
    : null;

  const signals: string[] = [
    `palavra-chave detectada: "${best.matched.join('", "')}"`,
  ];
  if (priorCategoryCount > 0) {
    signals.push(
      `cliente com histórico em chamados de ${category} (${priorCategoryCount})`,
    );
  } else {
    signals.push('cliente sem histórico anterior de chamados');
  }
  if (agentLabel) {
    signals.push(`destino sugerido pela regra “${best.rule.name}”: ${agentLabel}`);
  } else {
    signals.push('regra sem agente — enviar para revisão humana');
  }

  return {
    ruleId: best.rule.id,
    ruleName: best.rule.name,
    category,
    agentHandle,
    confidence,
    tone: toneFromConfidence(confidence),
    status: resolveStatus({
      ticket,
      category,
      agentHandle,
      confidence,
    }),
    matchedKeywords: best.matched,
    signals,
  };
}

function resolveStatus(input: {
  ticket: RoutingTicketInput;
  category: string;
  agentHandle: string | null;
  confidence: number;
}): RoutingStatus {
  const applied =
    input.ticket.category === input.category &&
    input.agentHandle !== null &&
    input.ticket.agentId === input.agentHandle;
  if (applied) return 'aplicado';
  if (
    input.confidence < REVIEW_THRESHOLD ||
    !input.agentHandle ||
    input.category === 'indefinido'
  ) {
    return 'revisao';
  }
  return 'pendente';
}
