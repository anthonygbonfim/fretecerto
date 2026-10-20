// Selo colorido com o status da meta.
import type { StatusMeta } from '../types';
import { ROTULO_STATUS } from '../utils/calculos';
import { IconeAlerta, IconeCheck, IconeInfo } from './Icones';

const ESTILO: Record<StatusMeta, string> = {
  viavel: 'bg-ok/15 text-ok border-ok/30',
  ajuste: 'bg-atencao/15 text-atencao border-atencao/30',
  inviavel: 'bg-perigo/15 text-perigo border-perigo/30',
};

const ICONE = { viavel: IconeCheck, ajuste: IconeInfo, inviavel: IconeAlerta };

export function SeloStatus({ status, grande = false }: { status: StatusMeta; grande?: boolean }) {
  const Icone = ICONE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${ESTILO[status]} ${
        grande ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs'
      }`}
    >
      <Icone tamanho={grande ? 16 : 13} strokeWidth={2.5} />
      {ROTULO_STATUS[status]}
    </span>
  );
}
