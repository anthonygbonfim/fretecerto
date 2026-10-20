// Mostra o diagnóstico (da IA ou do modo demonstração) em blocos fáceis de ler.
import type { ReactNode } from 'react';
import type { Diagnostico } from '../types';
import { formatarData } from '../utils/formatacao';
import { SeloStatus } from './SeloStatus';
import { IconeBandeira, IconeBrilho, IconeCofre, IconeCombustivel, IconeGrafico, IconeInfo } from './Icones';

function ListaDicas({ titulo, icone, itens }: { titulo: string; icone: ReactNode; itens: string[] }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-borda bg-superficie p-5">
      <h3 className="flex items-center gap-2 text-xl font-bold">
        <span className="grid size-8 place-items-center rounded-lg bg-sinal/15 text-sinal-forte dark:text-sinal">{icone}</span>
        {titulo}
      </h3>
      <ol className="flex flex-col gap-3">
        {itens.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-superficie-2 text-[11px] font-bold text-suave">
              {i + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PainelDiagnostico({ d }: { d: Diagnostico }) {
  return (
    <div className="flex flex-col gap-4">
      {d.origem === 'demo' ? (
        <div className="flex gap-3 rounded-2xl border-2 border-dashed border-sinal/60 bg-sinal/10 p-4 text-sm">
          <IconeInfo className="mt-0.5 shrink-0 text-sinal-forte dark:text-sinal" />
          <p>
            <strong className="font-semibold">Modo demonstração, sem IA.</strong> Este diagnóstico foi gerado por
            regras do próprio app. Para uma análise personalizada,{' '}
            <a href="#/config" className="font-semibold underline decoration-sinal decoration-2 underline-offset-2">
              cole sua chave gratuita do Gemini
            </a>
            .
          </p>
        </div>
      ) : (
        <p className="flex items-center gap-2 text-xs text-suave">
          <IconeBrilho tamanho={15} className="text-sinal" />
          Diagnóstico gerado pelo Google Gemini em {formatarData(d.geradoEm)}. A IA pode errar: use como orientação.
        </p>
      )}

      <section className="flex flex-col gap-3 rounded-2xl border border-borda bg-superficie p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xl font-bold">Viabilidade da meta</h3>
          <SeloStatus status={d.viabilidade.status} />
        </div>
        <p className="leading-relaxed">{d.viabilidade.texto}</p>
        <div className="h-px bg-borda" />
        <h3 className="text-xl font-bold">Diagnóstico do mês</h3>
        <p className="leading-relaxed text-texto/90">{d.diagnostico}</p>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <ListaDicas titulo="Gastar menos" icone={<IconeCombustivel tamanho={18} />} itens={d.dicasEconomia} />
        <ListaDicas titulo="Faturar mais" icone={<IconeGrafico tamanho={18} />} itens={d.ideiasReceita} />
        <ListaDicas titulo="Reserva" icone={<IconeCofre tamanho={18} />} itens={d.dicasReserva} />
      </div>

      <blockquote className="asfalto relative overflow-hidden rounded-2xl p-5 text-white">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-sinal" />
        <p className="flex gap-3 pl-2 font-titulo text-xl font-semibold leading-snug sm:text-2xl">
          <IconeBandeira className="mt-1 shrink-0 text-sinal" />
          {d.mensagemMotivacional}
        </p>
      </blockquote>
    </div>
  );
}
