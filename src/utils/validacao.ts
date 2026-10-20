// Validação do formulário, etapa por etapa.
import type { DadosFormulario, Entradas } from '../types';

export type Erros = Partial<Record<keyof DadosFormulario, string>>;

/** Campos de cada etapa — usado para validar só o que está na tela. */
export const CAMPOS_POR_ETAPA: (keyof DadosFormulario)[][] = [
  ['receita', 'km'],
  ['diesel', 'pedagios', 'manutencao'],
  ['custosFixos', 'parcelas', 'retirada'],
  ['metaNome', 'metaValor', 'metaPrazo'],
];

export function validarEtapa(etapa: number, d: DadosFormulario): Erros {
  const erros: Erros = {};

  if (etapa === 0) {
    if (!d.receita || d.receita <= 0) erros.receita = 'Informe quanto você faturou com fretes no mês.';
    if (!d.km || d.km <= 0) erros.km = 'Informe quantos km você rodou no mês.';
  }

  if (etapa === 1) {
    if (!d.diesel || d.diesel <= 0) erros.diesel = 'Informe o gasto com diesel e Arla.';
    if (d.manutencao === null) erros.manutencao = 'Informe a manutenção (pode ser 0,00).';
  }

  if (etapa === 2) {
    if (d.custosFixos === null) erros.custosFixos = 'Informe os custos fixos (pode ser 0,00).';
    if (d.retirada === null) erros.retirada = 'Informe quanto vai para casa (pode ser 0,00).';
  }

  if (etapa === 3) {
    if (d.metaNome.trim().length < 3) erros.metaNome = 'Dê um nome para a meta (mínimo 3 letras).';
    if (!d.metaValor || d.metaValor <= 0) erros.metaValor = 'Informe o valor da meta.';
    if (!d.metaPrazo || d.metaPrazo < 1 || d.metaPrazo > 120) erros.metaPrazo = 'O prazo deve ser de 1 a 120 meses.';
  }

  return erros;
}

/** Valida todas as etapas e devolve a primeira com erro (ou -1). */
export function primeiraEtapaComErro(d: DadosFormulario): number {
  return CAMPOS_POR_ETAPA.findIndex((_, i) => Object.keys(validarEtapa(i, d)).length > 0);
}

/** Converte o formulário validado em entradas numéricas (opcionais vazios = 0). */
export function paraEntradas(d: DadosFormulario): Entradas {
  return {
    receita: d.receita ?? 0,
    km: d.km ?? 0,
    diesel: d.diesel ?? 0,
    pedagios: d.pedagios ?? 0,
    manutencao: d.manutencao ?? 0,
    custosFixos: d.custosFixos ?? 0,
    parcelas: d.parcelas ?? 0,
    retirada: d.retirada ?? 0,
    metaNome: d.metaNome.trim(),
    metaValor: d.metaValor ?? 0,
    metaPrazo: d.metaPrazo ?? 1,
  };
}

/** Caminho inverso: usado para reabrir uma simulação e ajustar os números. */
export function paraFormulario(e: Entradas): DadosFormulario {
  return { ...e, pedagios: e.pedagios || null, parcelas: e.parcelas || null };
}
