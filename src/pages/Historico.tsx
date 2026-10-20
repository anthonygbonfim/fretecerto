// Histórico: todas as simulações salvas neste navegador.
import { useState } from 'react';
import type { Simulacao } from '../types';
import { Botao } from '../components/Botao';
import { SeloStatus } from '../components/SeloStatus';
import { IconeBrilho, IconeLixeira, IconeMais, IconeRelogio, IconeSetaDireita } from '../components/Icones';
import { excluirSimulacao, limparHistorico, listarSimulacoes } from '../services/historico';
import { calcularIndicadores } from '../utils/calculos';
import { formatarData, formatarMoeda } from '../utils/formatacao';

export function Historico() {
  const [lista, setLista] = useState<Simulacao[]>(listarSimulacoes);
  // Exclusão em dois cliques, sem janela de confirmação do navegador
  const [confirmando, setConfirmando] = useState<string | null>(null);

  function excluir(id: string) {
    if (confirmando !== id) {
      setConfirmando(id);
      return;
    }
    excluirSimulacao(id);
    setLista(listarSimulacoes());
    setConfirmando(null);
  }

  function limparTudo() {
    if (confirmando !== 'tudo') {
      setConfirmando('tudo');
      return;
    }
    limparHistorico();
    setLista([]);
    setConfirmando(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-extrabold">Histórico</h1>
          <p className="text-suave">
            {lista.length === 0
              ? 'Nenhuma simulação salva ainda.'
              : `${lista.length} ${lista.length === 1 ? 'simulação salva' : 'simulações salvas'} neste navegador.`}
          </p>
        </div>
        {lista.length > 0 && (
          <Botao variante="perigo" className="text-xs" onClick={limparTudo} onBlur={() => setConfirmando(null)}>
            <IconeLixeira tamanho={16} />
            {confirmando === 'tudo' ? 'Confirmar: apagar tudo?' : 'Limpar histórico'}
          </Botao>
        )}
      </div>

      {lista.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-borda px-6 py-14 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-superficie-2 text-suave">
            <IconeRelogio tamanho={28} />
          </span>
          <p className="max-w-sm text-suave">
            Quando você fizer uma simulação, ela aparece aqui para você comparar os meses e acompanhar a meta.
          </p>
          <Botao href="#/simular">
            <IconeMais tamanho={18} /> Fazer a primeira simulação
          </Botao>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {lista.map((s) => {
            const ind = calcularIndicadores(s.entradas);
            return (
              <li
                key={s.id}
                className="flex flex-col gap-4 rounded-2xl border border-borda bg-superficie p-4 transition-colors hover:border-sinal/60 sm:flex-row sm:items-center sm:p-5"
              >
                <a href={`#/resultado/${s.id}`} className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-lg">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-xl font-bold">{s.entradas.metaNome}</h2>
                    <SeloStatus status={ind.status} />
                    {s.diagnostico?.origem === 'ia' && (
                      <span className="inline-flex items-center gap-1 text-xs text-suave" title="Diagnóstico com IA">
                        <IconeBrilho tamanho={13} className="text-sinal" /> IA
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-suave">{formatarData(s.criadoEm)}</p>
                  <dl className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                    <div className="flex gap-1.5">
                      <dt className="text-suave">Receita</dt>
                      <dd className="font-medium tabular-nums">{formatarMoeda(s.entradas.receita)}</dd>
                    </div>
                    <div className="flex gap-1.5">
                      <dt className="text-suave">Sobra</dt>
                      <dd className={`font-medium tabular-nums ${ind.sobraMensal < 0 ? 'text-perigo' : ''}`}>
                        {formatarMoeda(ind.sobraMensal)}
                      </dd>
                    </div>
                    <div className="flex gap-1.5">
                      <dt className="text-suave">Meta</dt>
                      <dd className="font-medium tabular-nums">{formatarMoeda(s.entradas.metaValor)}</dd>
                    </div>
                  </dl>
                </a>
                <div className="flex gap-2 sm:flex-col">
                  <Botao href={`#/resultado/${s.id}`} variante="secundario" className="flex-1 text-xs">
                    Abrir <IconeSetaDireita tamanho={16} />
                  </Botao>
                  <Botao
                    variante={confirmando === s.id ? 'perigo' : 'fantasma'}
                    className="flex-1 text-xs"
                    onClick={() => excluir(s.id)}
                    onBlur={() => setConfirmando(null)}
                    aria-label={`Excluir simulação ${s.entradas.metaNome}`}
                  >
                    <IconeLixeira tamanho={16} />
                    {confirmando === s.id ? 'Confirmar' : 'Excluir'}
                  </Botao>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
