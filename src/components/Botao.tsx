// Botão padrão do app. Com "href" vira um link (usado nas rotas #/).
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

type Variante = 'primario' | 'secundario' | 'fantasma' | 'perigo';

const ESTILOS: Record<Variante, string> = {
  primario: 'bg-sinal text-asfalto hover:bg-sinal-forte shadow-[0_3px_0_0_var(--color-sinal-forte)] hover:shadow-none active:translate-y-px',
  secundario: 'border-2 border-borda bg-superficie text-texto hover:border-sinal',
  fantasma: 'text-suave hover:text-texto hover:bg-superficie-2',
  perigo: 'border-2 border-perigo/40 text-perigo hover:bg-perigo/10',
};

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 min-h-11 font-semibold text-sm transition-colors cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none';

interface Comum {
  variante?: Variante;
  children: ReactNode;
  className?: string;
}

type ComoBotao = Comum & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ComoLink = Comum & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function Botao(props: ComoBotao | ComoLink) {
  const { variante = 'primario', className = '', children, ...resto } = props;
  const classes = `${BASE} ${ESTILOS[variante]} ${className}`;

  if (typeof resto.href === 'string') {
    return (
      <a className={classes} {...(resto as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={classes} {...(resto as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
