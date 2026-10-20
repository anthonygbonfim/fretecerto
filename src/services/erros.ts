// Erro padronizado do diagnóstico, com mensagem pronta para mostrar na tela.

export type TipoErro = 'chave' | 'limite' | 'rede' | 'tempo' | 'servico' | 'resposta';

const MENSAGENS: Record<TipoErro, { titulo: string; texto: string }> = {
  chave: {
    titulo: 'Chave do Gemini inválida',
    texto: 'A chave salva não foi aceita pelo Google. Confira se copiou ela inteira em Configurações.',
  },
  limite: {
    titulo: 'Limite de uso atingido',
    texto: 'O plano gratuito do Gemini tem um limite de pedidos por minuto e por dia. Espere um pouco e tente de novo.',
  },
  rede: {
    titulo: 'Sem conexão com a internet',
    texto: 'Não deu para falar com o Gemini. Verifique sua internet e tente de novo.',
  },
  tempo: {
    titulo: 'A resposta demorou demais',
    texto: 'O Gemini não respondeu a tempo. Pode ser instabilidade do sinal ou do serviço.',
  },
  servico: {
    titulo: 'O Gemini está instável',
    texto: 'O serviço do Google está com problemas ou sobrecarregado agora. Tente de novo em instantes.',
  },
  resposta: {
    titulo: 'Resposta inesperada da IA',
    texto: 'A IA devolveu algo fora do formato combinado. Tentar de novo costuma resolver.',
  },
};

export class ErroDiagnostico extends Error {
  readonly tipo: TipoErro;
  readonly titulo: string;

  constructor(tipo: TipoErro, detalhe?: string) {
    super(detalhe ? `${MENSAGENS[tipo].texto} (${detalhe})` : MENSAGENS[tipo].texto);
    this.name = 'ErroDiagnostico';
    this.tipo = tipo;
    this.titulo = MENSAGENS[tipo].titulo;
  }
}
