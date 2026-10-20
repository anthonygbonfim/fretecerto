// Todos os indicadores financeiros são calculados aqui, no código.
// A IA só recebe esses números prontos para comentar — ela nunca calcula nada.
import type { Entradas, Indicadores, StatusMeta } from '../types';
import { formatarMoeda, formatarMeses } from './formatacao';

/** Se faltar até 20% da parcela mensal da meta, ainda dá para ajustar. */
export const TOLERANCIA_AJUSTE = 0.2;

/** Divisão que devolve 0 em vez de Infinity/NaN. */
function dividir(a: number, b: number): number {
  return b > 0 ? a / b : 0;
}

/** Arredonda para centavos, evitando "dízimas" como 0.30000000000000004. */
function centavos(valor: number): number {
  return Math.round(valor * 100) / 100;
}

export function calcularIndicadores(e: Entradas): Indicadores {
  // Custos que variam com a viagem
  const custosEstrada = e.diesel + e.pedagios + e.manutencao;
  // Custos do caminhão que existem mesmo parado
  const custosFixosTotais = e.custosFixos + e.parcelas;
  const custoTotal = custosEstrada + custosFixosTotais;

  // Lucro operacional: o que o caminhão gera depois de pagar a si mesmo
  const lucroOperacional = e.receita - custoTotal;
  // Sobra: o que fica depois da retirada para a casa
  const sobraMensal = lucroOperacional - e.retirada;

  const guardarPorMes = dividir(e.metaValor, e.metaPrazo);
  const prazoRealista = sobraMensal > 0 ? Math.ceil(e.metaValor / sobraMensal) : null;
  const coberturaMeta = guardarPorMes > 0 ? Math.max(0, (sobraMensal / guardarPorMes) * 100) : 0;

  return {
    custosEstrada: centavos(custosEstrada),
    custosFixosTotais: centavos(custosFixosTotais),
    custoTotal: centavos(custoTotal),
    lucroOperacional: centavos(lucroOperacional),
    sobraMensal: centavos(sobraMensal),
    margem: dividir(lucroOperacional, e.receita) * 100,
    receitaPorKm: dividir(e.receita, e.km),
    custoPorKm: dividir(custoTotal, e.km),
    lucroPorKm: dividir(lucroOperacional, e.km),
    pesoDiesel: dividir(e.diesel, e.receita) * 100,
    guardarPorMes: centavos(guardarPorMes),
    prazoRealista,
    coberturaMeta,
    faltaPorMes: centavos(Math.max(0, guardarPorMes - sobraMensal)),
    status: definirStatus(sobraMensal, guardarPorMes),
  };
}

/**
 * Regra de viabilidade:
 * - viável: a sobra cobre a parcela mensal da meta;
 * - precisa de ajuste: falta até 20% da parcela;
 * - fora do prazo: falta mais que isso.
 */
export function definirStatus(sobra: number, necessario: number): StatusMeta {
  if (sobra >= necessario) return 'viavel';
  if (sobra >= necessario * (1 - TOLERANCIA_AJUSTE)) return 'ajuste';
  return 'inviavel';
}

export const ROTULO_STATUS: Record<StatusMeta, string> = {
  viavel: 'Viável',
  ajuste: 'Precisa de ajuste',
  inviavel: 'Fora do prazo',
};

/** Frase curta, escrita pelo código, que explica o status da meta. */
export function resumoStatus(e: Entradas, ind: Indicadores): string {
  const parcela = formatarMoeda(ind.guardarPorMes);
  const sobra = formatarMoeda(ind.sobraMensal);
  if (ind.status === 'viavel') {
    return `Sua sobra de ${sobra} por mês cobre os ${parcela} que "${e.metaNome}" pede em ${formatarMeses(e.metaPrazo)}.`;
  }
  if (ind.sobraMensal <= 0) {
    return `Hoje não sobra dinheiro no fim do mês. Antes da meta, é preciso equilibrar as contas.`;
  }
  const realista = ind.prazoRealista ? ` No ritmo atual, você chega lá em ${formatarMeses(ind.prazoRealista)}.` : '';
  return `Faltam ${formatarMoeda(ind.faltaPorMes)} por mês para guardar os ${parcela} necessários.${realista}`;
}
