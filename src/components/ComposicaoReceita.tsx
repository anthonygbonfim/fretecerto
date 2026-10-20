// Barra empilhada mostrando para onde vai cada real do frete.
import type { Entradas, Indicadores } from '../types';
import { formatarMoeda, formatarPercentual } from '../utils/formatacao';

interface Fatia {
  rotulo: string;
  valor: number;
  /** Cor sólida ou padrão (background) da fatia e da bolinha da legenda. */
  fundo: string;
}

/** Sobra em listras diagonais cinza, para não depender só da cor. */
const LISTRAS_CINZA = 'repeating-linear-gradient(45deg, #9ca3af 0 2px, #4b5563 2px 4px)';

export function ComposicaoReceita({ e, ind }: { e: Entradas; ind: Indicadores }) {
  const fatias: Fatia[] = [
    { rotulo: 'Diesel e Arla', valor: e.diesel, fundo: '#3987e5' },
    { rotulo: 'Pedágios', valor: e.pedagios, fundo: '#d95926' },
    { rotulo: 'Manutenção', valor: e.manutencao, fundo: '#199e70' },
    { rotulo: 'Custos fixos', valor: e.custosFixos, fundo: '#c98500' },
    { rotulo: 'Parcelas', valor: e.parcelas, fundo: '#d55181' },
    { rotulo: 'Retirada', valor: e.retirada, fundo: '#9085e9' },
    { rotulo: 'Sobra', valor: Math.max(0, ind.sobraMensal), fundo: LISTRAS_CINZA },
  ].filter((f) => f.valor > 0);

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-borda bg-superficie p-5">
      <div>
        <h3 className="text-xl font-bold">Para onde vai o frete</h3>
        <p className="text-sm text-suave">Cada parte da barra é uma fatia dos {formatarMoeda(e.receita)} faturados.</p>
      </div>

      {/* flex-grow proporcional ao valor: as fatias somam 100% descontando os 2px de espaço entre elas.
          Se os gastos passam da receita, o total gasto vira os 100%. */}
      <div className="flex h-5 gap-0.5 overflow-hidden rounded-full" role="img" aria-label="Divisão da receita do mês">
        {fatias.map((f) => (
          <div
            key={f.rotulo}
            className="h-full"
            style={{ flex: `${f.valor} 1 0px`, background: f.fundo }}
            title={`${f.rotulo}: ${formatarMoeda(f.valor)}`}
          />
        ))}
      </div>

      <ul className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {fatias.map((f) => (
          <li key={f.rotulo} className="flex items-center gap-2">
            <span className="size-3 shrink-0 rounded-full" style={{ background: f.fundo }} />
            <span className="flex-1">{f.rotulo}</span>
            <span className="font-medium tabular-nums">{formatarMoeda(f.valor)}</span>
            <span className="w-14 text-right text-xs tabular-nums text-suave">{formatarPercentual((f.valor / e.receita) * 100)}</span>
          </li>
        ))}
      </ul>

      {ind.sobraMensal < 0 && (
        <p className="rounded-lg bg-perigo/10 px-3 py-2 text-sm text-perigo">
          Os gastos passam a receita em {formatarMoeda(Math.abs(ind.sobraMensal))} — o mês fecha no vermelho.
        </p>
      )}
    </section>
  );
}
