// Escolhe entre IA (com chave) e modo demonstração (sem chave),
// e impede que a mesma simulação dispare duas chamadas ao mesmo tempo.
import type { Diagnostico, Simulacao } from '../types';
import { calcularIndicadores } from '../utils/calculos';
import { gerarDiagnosticoIA } from './gemini';
import { gerarDiagnosticoLocal } from './diagnosticoLocal';

/** Pedidos em andamento, por simulação e modo. */
const pendentes = new Map<string, Promise<Diagnostico>>();

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function obterDiagnostico(sim: Simulacao, chave: string): Promise<Diagnostico> {
  const usarIA = chave.trim() !== '';
  const id = `${sim.id}:${usarIA ? 'ia' : 'demo'}`;

  // Se já existe um pedido igual rodando, reaproveita a mesma promessa.
  const existente = pendentes.get(id);
  if (existente) return existente;

  const indicadores = calcularIndicadores(sim.entradas);
  const pedido = (async () => {
    if (usarIA) return gerarDiagnosticoIA(sim.entradas, indicadores, chave);
    // Pequena pausa para o modo demonstração ter a mesma "sensação" do real
    await esperar(600);
    return gerarDiagnosticoLocal(sim.entradas, indicadores);
  })().finally(() => pendentes.delete(id));

  pendentes.set(id, pedido);
  return pedido;
}
