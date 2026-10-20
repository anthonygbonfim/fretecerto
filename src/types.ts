// Tipos compartilhados por todo o app.

/** Valores do formulário enquanto a pessoa digita (null = campo vazio). */
export interface DadosFormulario {
  receita: number | null;
  km: number | null;
  diesel: number | null;
  pedagios: number | null;
  manutencao: number | null;
  custosFixos: number | null;
  parcelas: number | null;
  retirada: number | null;
  metaNome: string;
  metaValor: number | null;
  metaPrazo: number | null;
}

/** Valores já validados: campos opcionais vazios viram 0. */
export interface Entradas {
  receita: number;
  km: number;
  diesel: number;
  pedagios: number;
  manutencao: number;
  custosFixos: number;
  parcelas: number;
  retirada: number;
  metaNome: string;
  metaValor: number;
  metaPrazo: number;
}

export type StatusMeta = 'viavel' | 'ajuste' | 'inviavel';

/** Indicadores calculados no código (nunca pela IA). */
export interface Indicadores {
  custosEstrada: number;
  custosFixosTotais: number;
  custoTotal: number;
  lucroOperacional: number;
  sobraMensal: number;
  margem: number;
  receitaPorKm: number;
  custoPorKm: number;
  lucroPorKm: number;
  pesoDiesel: number;
  guardarPorMes: number;
  /** Meses para atingir a meta guardando toda a sobra (null = nunca, sobra ≤ 0). */
  prazoRealista: number | null;
  /** Quanto da parcela mensal necessária a sobra cobre, em %. */
  coberturaMeta: number;
  faltaPorMes: number;
  status: StatusMeta;
}

export interface Diagnostico {
  viabilidade: { status: StatusMeta; texto: string };
  diagnostico: string;
  dicasEconomia: string[];
  ideiasReceita: string[];
  dicasReserva: string[];
  mensagemMotivacional: string;
  /** 'ia' = Gemini; 'demo' = regras locais (modo demonstração). */
  origem: 'ia' | 'demo';
  geradoEm: string;
}

export interface Simulacao {
  id: string;
  criadoEm: string;
  entradas: Entradas;
  diagnostico: Diagnostico | null;
}
