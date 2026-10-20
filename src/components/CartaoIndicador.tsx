// Cartão de um indicador numérico do resultado.
import type { ReactNode } from 'react';

export type Tom = 'neutro' | 'bom' | 'atencao' | 'ruim';

const COR_VALOR: Record<Tom, string> = {
  neutro: 'text-texto',
  bom: 'text-ok',
  atencao: 'text-atencao',
  ruim: 'text-perigo',
};

interface Props {
  rotulo: string;
  valor: string;
  detalhe?: string;
  tom?: Tom;
  icone?: ReactNode;
}

export function CartaoIndicador({ rotulo, valor, detalhe, tom = 'neutro', icone }: Props) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-2xl border border-borda bg-superficie p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-suave">
        {icone}
        {rotulo}
      </div>
      {/* overflow-wrap evita rolagem lateral com valores muito grandes no celular */}
      <p className={`font-titulo text-2xl font-bold tabular-nums [overflow-wrap:anywhere] sm:text-[1.7rem] ${COR_VALOR[tom]}`}>
        {valor}
      </p>
      {detalhe && <p className="text-xs leading-snug text-suave">{detalhe}</p>}
    </div>
  );
}
