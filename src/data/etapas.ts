// Textos das 4 etapas do formulário.

export interface Etapa {
  titulo: string;
  descricao: string;
}

export const ETAPAS: Etapa[] = [
  {
    titulo: 'Seus fretes',
    descricao: 'Comece pelo que entrou: quanto você faturou e quanto rodou no mês.',
  },
  {
    titulo: 'Custos da estrada',
    descricao: 'O que você gasta para o caminhão rodar. Use a média de um mês normal.',
  },
  {
    titulo: 'Custos fixos',
    descricao: 'Contas que chegam todo mês, rodando ou parado — e o que vai para casa.',
  },
  {
    titulo: 'Sua meta',
    descricao: 'O que você quer conquistar e em quanto tempo.',
  },
];
