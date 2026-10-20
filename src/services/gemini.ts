// Integração com a API do Google Gemini.
// A chave vem das Configurações (localStorage) e vai direto do navegador para o Google:
// ela nunca passa por servidor nosso nem fica no código.
import type { Diagnostico, Entradas, Indicadores } from '../types';
import { ROTULO_STATUS } from '../utils/calculos';
import { formatarInteiro, formatarMeses, formatarMoeda, formatarPercentual, formatarPorKm } from '../utils/formatacao';
import { ErroDiagnostico } from './erros';
import { gerarDiagnosticoLocal } from './diagnosticoLocal';

const MODELO = 'gemini-flash-latest';
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const TEMPO_LIMITE_MS = 45_000;

/** Formato do JSON que pedimos à IA (o Gemini respeita esse esquema). */
const ESQUEMA_RESPOSTA = {
  type: 'OBJECT',
  properties: {
    viabilidade: {
      type: 'OBJECT',
      properties: {
        status: { type: 'STRING', enum: ['viavel', 'ajuste', 'inviavel'] },
        texto: { type: 'STRING' },
      },
      required: ['status', 'texto'],
    },
    diagnostico: { type: 'STRING' },
    dicasEconomia: { type: 'ARRAY', items: { type: 'STRING' } },
    ideiasReceita: { type: 'ARRAY', items: { type: 'STRING' } },
    dicasReserva: { type: 'ARRAY', items: { type: 'STRING' } },
    mensagemMotivacional: { type: 'STRING' },
  },
  required: ['viabilidade', 'diagnostico', 'dicasEconomia', 'ideiasReceita', 'dicasReserva', 'mensagemMotivacional'],
};

/** Monta o texto enviado à IA, já com todos os números calculados pelo app. */
function montarPrompt(e: Entradas, ind: Indicadores): string {
  const numeros = {
    receitaFretes: formatarMoeda(e.receita),
    kmRodados: `${formatarInteiro(e.km)} km`,
    dieselEArla: formatarMoeda(e.diesel),
    pedagios: formatarMoeda(e.pedagios),
    manutencao: formatarMoeda(e.manutencao),
    seguroRastreadorIpvaContador: formatarMoeda(e.custosFixos),
    parcelasDoCaminhao: formatarMoeda(e.parcelas),
    retiradaParaCasa: formatarMoeda(e.retirada),
    lucroOperacional: formatarMoeda(ind.lucroOperacional),
    sobraMensal: formatarMoeda(ind.sobraMensal),
    margemOperacional: formatarPercentual(ind.margem),
    receitaPorKm: formatarPorKm(ind.receitaPorKm),
    custoPorKm: formatarPorKm(ind.custoPorKm),
    lucroPorKm: formatarPorKm(ind.lucroPorKm),
    pesoDoDieselNaReceita: formatarPercentual(ind.pesoDiesel),
    meta: e.metaNome,
    valorDaMeta: formatarMoeda(e.metaValor),
    prazoDesejado: formatarMeses(e.metaPrazo),
    precisaGuardarPorMes: formatarMoeda(ind.guardarPorMes),
    prazoRealista: ind.prazoRealista ? formatarMeses(ind.prazoRealista) : 'não atinge (sobra zero ou negativa)',
    statusDaMeta: ROTULO_STATUS[ind.status],
  };

  return `Você é um consultor financeiro que entende a rotina de caminhoneiros autônomos no Brasil.
Analise os números do mês de um caminhoneiro e devolva um diagnóstico em JSON.

REGRAS:
- Use somente os números abaixo. Eles já foram calculados pelo aplicativo: NÃO recalcule, NÃO invente valores novos.
- Escreva em português do Brasil, em segunda pessoa ("você"), com linguagem simples, direta e respeitosa, como uma conversa de posto de estrada. Nada de jargão financeiro.
- "viabilidade.status" deve ser exatamente "${ind.status}". "viabilidade.texto": 1 ou 2 frases explicando esse status.
- "diagnostico": um parágrafo de 3 a 5 frases sobre a saúde financeira do mês (margem, custo por km, peso do diesel, sobra).
- "dicasEconomia": exatamente 4 dicas práticas para gastar menos na estrada, focando nos custos que mais pesam.
- "ideiasReceita": exatamente 4 ideias para faturar mais (ex.: frete de retorno, negociar com base no piso mínimo da ANTT, cobrar estadia, contratos fixos).
- "dicasReserva": exatamente 4 dicas para montar e proteger uma reserva financeira.
- "mensagemMotivacional": 1 ou 2 frases de incentivo citando a meta "${e.metaNome}" pelo nome.
- Cada dica com no máximo 2 frases.

NÚMEROS DO MÊS:
${JSON.stringify(numeros, null, 2)}`;
}

/** Remove cercas de código (```json) caso a IA as inclua por engano. */
function limparJson(texto: string): string {
  return texto.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
}

function listaDeTextos(valor: unknown): string[] {
  return Array.isArray(valor) ? valor.filter((v): v is string => typeof v === 'string' && v.trim() !== '') : [];
}

/** Garante 4 itens: se a IA mandar menos, completa com dicas das regras locais. */
function completar(lista: string[], reserva: string[]): string[] {
  const resultado = lista.slice(0, 4);
  for (const item of reserva) {
    if (resultado.length >= 4) break;
    if (!resultado.includes(item)) resultado.push(item);
  }
  return resultado;
}

/** Valida o JSON da IA e encaixa no formato do app. */
function normalizar(bruto: unknown, e: Entradas, ind: Indicadores): Diagnostico {
  if (!bruto || typeof bruto !== 'object') throw new ErroDiagnostico('resposta');
  const r = bruto as Record<string, unknown>;
  const viab = (r.viabilidade ?? {}) as Record<string, unknown>;
  const local = gerarDiagnosticoLocal(e, ind);

  const diagnostico = typeof r.diagnostico === 'string' ? r.diagnostico.trim() : '';
  if (!diagnostico) throw new ErroDiagnostico('resposta');

  return {
    // O status sempre vem do código, mesmo que a IA discorde.
    viabilidade: {
      status: ind.status,
      texto: typeof viab.texto === 'string' && viab.texto.trim() ? viab.texto.trim() : local.viabilidade.texto,
    },
    diagnostico,
    dicasEconomia: completar(listaDeTextos(r.dicasEconomia), local.dicasEconomia),
    ideiasReceita: completar(listaDeTextos(r.ideiasReceita), local.ideiasReceita),
    dicasReserva: completar(listaDeTextos(r.dicasReserva), local.dicasReserva),
    mensagemMotivacional:
      typeof r.mensagemMotivacional === 'string' && r.mensagemMotivacional.trim()
        ? r.mensagemMotivacional.trim()
        : local.mensagemMotivacional,
    origem: 'ia',
    geradoEm: new Date().toISOString(),
  };
}

/** Traduz o status HTTP / corpo de erro do Google para um erro amigável. */
async function erroDaResposta(resposta: Response): Promise<ErroDiagnostico> {
  let mensagem = '';
  try {
    const corpo = await resposta.json();
    mensagem = JSON.stringify(corpo?.error ?? '');
  } catch {
    // Corpo vazio ou não-JSON: seguimos só com o status.
  }
  const s = resposta.status;
  // 400 / 401 / 403: o Google recusou a chave
  if (s === 400 || s === 401 || s === 403 || /API_KEY_INVALID|API key not valid|PERMISSION_DENIED/i.test(mensagem)) {
    return new ErroDiagnostico('chave');
  }
  if (s === 429 || /RESOURCE_EXHAUSTED|quota/i.test(mensagem)) return new ErroDiagnostico('limite');
  if (s >= 500) return new ErroDiagnostico('servico', `HTTP ${s}`);
  return new ErroDiagnostico('resposta', `HTTP ${s}`);
}

/** fetch com tempo limite e mensagens de erro de rede amigáveis. */
async function chamar(url: string, init: RequestInit): Promise<Response> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new ErroDiagnostico('rede');
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
  try {
    return await fetch(url, { ...init, signal: controle.signal });
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === 'AbortError') throw new ErroDiagnostico('tempo');
    throw new ErroDiagnostico('rede');
  } finally {
    clearTimeout(timer);
  }
}

export async function gerarDiagnosticoIA(e: Entradas, ind: Indicadores, chave: string): Promise<Diagnostico> {
  const resposta = await chamar(`${BASE}/${MODELO}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': chave.trim() },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: montarPrompt(e, ind) }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: ESQUEMA_RESPOSTA,
        temperature: 0.7,
      },
    }),
  });

  if (!resposta.ok) throw await erroDaResposta(resposta);

  const dados = await resposta.json().catch(() => null);
  const texto: string =
    dados?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
  if (!texto) throw new ErroDiagnostico('resposta', dados?.promptFeedback?.blockReason);

  let json: unknown;
  try {
    json = JSON.parse(limparJson(texto));
  } catch {
    throw new ErroDiagnostico('resposta');
  }
  return normalizar(json, e, ind);
}

/**
 * Testa a chave consultando os dados do modelo.
 * Essa consulta não gera texto, então não gasta a cota de geração.
 */
export async function testarChave(chave: string): Promise<void> {
  const resposta = await chamar(`${BASE}/${MODELO}`, {
    headers: { 'x-goog-api-key': chave.trim() },
  });
  if (!resposta.ok) throw await erroDaResposta(resposta);
}
