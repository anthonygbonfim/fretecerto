// Barra de progresso em forma de estrada: o caminhão avança a cada etapa.
import { ETAPAS } from '../data/etapas';
import { IconeCaminhao, IconeCheck } from './Icones';

interface Props {
  etapa: number;
  /** Permite voltar clicando numa etapa já concluída. */
  aoIrPara: (etapa: number) => void;
}

export function BarraProgresso({ etapa, aoIrPara }: Props) {
  const total = ETAPAS.length;
  const progresso = ((etapa + 1) / total) * 100;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-semibold text-suave">
          Etapa {etapa + 1} de {total}
        </span>
        <span className="font-titulo text-base font-semibold text-sinal">{Math.round(progresso)}%</span>
      </div>

      {/* Pista com a faixa tracejada e o caminhão na ponta */}
      <div
        className="relative h-3 rounded-full asfalto"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={etapa + 1}
        aria-valuetext={`Etapa ${etapa + 1} de ${total}: ${ETAPAS[etapa].titulo}`}
      >
        <div className="absolute inset-y-0 left-0 flex items-center px-1.5 transition-[width] duration-500" style={{ width: `${progresso}%` }}>
          <div className="h-1 w-full faixa-pista" />
        </div>
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-sinal p-1 text-asfalto shadow-md transition-[left] duration-500"
          style={{ left: `clamp(14px, ${progresso}% - 14px, calc(100% - 14px))` }}
        >
          <IconeCaminhao tamanho={16} />
        </div>
      </div>

      <ol className="grid grid-cols-4 gap-2">
        {ETAPAS.map((e, i) => {
          const feita = i < etapa;
          const atual = i === etapa;
          return (
            <li key={e.titulo}>
              <button
                type="button"
                disabled={!feita}
                onClick={() => aoIrPara(i)}
                className={`flex w-full flex-col items-center gap-1 rounded-lg py-1 text-center text-xs font-medium transition-colors sm:flex-row sm:justify-center sm:gap-1.5 ${
                  atual ? 'text-texto' : feita ? 'cursor-pointer text-suave hover:text-texto' : 'text-suave/60'
                }`}
                aria-current={atual ? 'step' : undefined}
              >
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                    atual ? 'bg-sinal text-asfalto' : feita ? 'bg-ok/20 text-ok' : 'bg-superficie-2 text-suave'
                  }`}
                >
                  {feita ? <IconeCheck tamanho={13} strokeWidth={3} /> : i + 1}
                </span>
                <span className="leading-tight">{e.titulo}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
