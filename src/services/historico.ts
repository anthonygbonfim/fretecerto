// Histórico de simulações, guardado só no navegador (localStorage).
import type { Diagnostico, Entradas, Simulacao } from '../types';
import { CHAVES, gerarId, gravar, ler, remover } from '../utils/armazenamento';

/** Mantém no máximo 100 simulações para não lotar o armazenamento. */
const LIMITE = 100;

export function listarSimulacoes(): Simulacao[] {
  const lista = ler<Simulacao[]>(CHAVES.historico, []);
  return Array.isArray(lista) ? lista : [];
}

export function obterSimulacao(id: string): Simulacao | null {
  return listarSimulacoes().find((s) => s.id === id) ?? null;
}

/** Cria uma simulação nova no topo da lista e devolve o id. */
export function criarSimulacao(entradas: Entradas): string {
  const nova: Simulacao = { id: gerarId(), criadoEm: new Date().toISOString(), entradas, diagnostico: null };
  gravar(CHAVES.historico, [nova, ...listarSimulacoes()].slice(0, LIMITE));
  return nova.id;
}

export function salvarDiagnostico(id: string, diagnostico: Diagnostico): void {
  const lista = listarSimulacoes().map((s) => (s.id === id ? { ...s, diagnostico } : s));
  gravar(CHAVES.historico, lista);
}

export function excluirSimulacao(id: string): void {
  gravar(
    CHAVES.historico,
    listarSimulacoes().filter((s) => s.id !== id),
  );
}

export function limparHistorico(): void {
  remover(CHAVES.historico);
}
