// Controla o ciclo do diagnóstico: carregando → pronto ou erro → tentar de novo.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Diagnostico, Simulacao } from '../types';
import { obterDiagnostico } from '../services/diagnostico';
import { ErroDiagnostico } from '../services/erros';
import { obterSimulacao, salvarDiagnostico } from '../services/historico';

type Fase = 'carregando' | 'pronto' | 'erro';

interface Estado {
  fase: Fase;
  diagnostico: Diagnostico | null;
  erro: ErroDiagnostico | null;
}

export function useDiagnostico(sim: Simulacao | null, chave: string) {
  const [estado, setEstado] = useState<Estado>(() => ({
    fase: sim?.diagnostico ? 'pronto' : 'carregando',
    diagnostico: sim?.diagnostico ?? null,
    erro: null,
  }));

  // Trava contra cliques repetidos: só um pedido por vez nesta tela.
  const emAndamento = useRef(false);

  /** modo 'demo' força as regras locais, mesmo com chave salva. */
  const gerar = useCallback(
    async (modo: 'auto' | 'demo' = 'auto') => {
      if (!sim || emAndamento.current) return;

      // Se a IA já gerou o diagnóstico desta simulação, usa o salvo e não chama a API de novo.
      const salvo = obterSimulacao(sim.id)?.diagnostico;
      if (modo === 'auto' && salvo?.origem === 'ia') {
        setEstado({ fase: 'pronto', diagnostico: salvo, erro: null });
        return;
      }

      emAndamento.current = true;
      setEstado((e) => ({ ...e, fase: 'carregando', erro: null }));

      try {
        const diagnostico = await obterDiagnostico(sim, modo === 'demo' ? '' : chave);
        salvarDiagnostico(sim.id, diagnostico);
        setEstado({ fase: 'pronto', diagnostico, erro: null });
      } catch (erro) {
        const amigavel = erro instanceof ErroDiagnostico ? erro : new ErroDiagnostico('resposta');
        setEstado({ fase: 'erro', diagnostico: null, erro: amigavel });
      } finally {
        emAndamento.current = false;
      }
    },
    [sim, chave],
  );

  // Gera automaticamente na primeira visita (simulação ainda sem diagnóstico).
  const jaPediu = useRef(false);
  useEffect(() => {
    if (sim && !sim.diagnostico && !jaPediu.current) {
      jaPediu.current = true;
      void gerar();
    }
  }, [sim, gerar]);

  return { ...estado, carregando: estado.fase === 'carregando', gerar };
}
