// Dados de exemplo de um caminhoneiro autônomo,
// usados no botão "Preencher com exemplo" e como placeholders dos campos.
import type { DadosFormulario } from '../types';

export const FORMULARIO_VAZIO: DadosFormulario = {
  receita: null,
  km: null,
  diesel: null,
  pedagios: null,
  manutencao: null,
  custosFixos: null,
  parcelas: null,
  retirada: null,
  metaNome: '',
  metaValor: null,
  metaPrazo: null,
};

export const EXEMPLO: DadosFormulario = {
  receita: 18000,
  km: 9000,
  diesel: 7500,
  pedagios: 1200,
  manutencao: 1500,
  custosFixos: 1300,
  parcelas: 3200,
  retirada: 2500,
  metaNome: 'Jogo de pneus novos',
  metaValor: 12000,
  metaPrazo: 6,
};
