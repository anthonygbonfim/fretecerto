// Campos do formulário: dinheiro (com máscara), números inteiros e texto.
import { useId, type ReactNode } from 'react';
import { formatarDecimal, formatarInteiro, mascaraParaDinheiro, mascaraParaInteiro } from '../utils/formatacao';

interface PropsMoldura {
  rotulo: string;
  ajuda?: string;
  erro?: string;
  opcional?: boolean;
}

/** Rótulo + caixa + mensagem de ajuda/erro, comum a todos os campos. */
function Moldura({
  id,
  rotulo,
  ajuda,
  erro,
  opcional,
  prefixo,
  sufixo,
  children,
}: PropsMoldura & { id: string; prefixo?: string; sufixo?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-sm font-semibold">
        {rotulo}
        {opcional && <span className="text-xs font-normal text-suave">opcional</span>}
      </label>
      <div
        className={`flex items-center rounded-xl border-2 bg-superficie transition-colors focus-within:border-sinal ${
          erro ? 'border-perigo' : 'border-borda'
        }`}
      >
        {prefixo && <span className="pl-3.5 font-titulo text-lg font-semibold text-suave">{prefixo}</span>}
        {children}
        {sufixo && <span className="pr-3.5 text-sm text-suave">{sufixo}</span>}
      </div>
      {erro ? (
        <p id={`${id}-msg`} className="text-sm text-perigo" role="alert">
          {erro}
        </p>
      ) : (
        ajuda && (
          <p id={`${id}-msg`} className="text-xs text-suave">
            {ajuda}
          </p>
        )
      )}
    </div>
  );
}

const CLASSE_INPUT =
  'w-full min-w-0 bg-transparent px-3 py-3 text-lg font-medium tabular-nums outline-none placeholder:text-suave/50 [&:focus-visible]:outline-none';

interface CampoNumerico extends PropsMoldura {
  valor: number | null;
  aoMudar: (valor: number | null) => void;
}

/** Dinheiro: a pessoa digita números e o campo mostra 1.234,56. */
export function CampoDinheiro({
  valor,
  aoMudar,
  placeholder = '0,00',
  ...moldura
}: CampoNumerico & { placeholder?: string }) {
  const id = useId();
  const exibido = valor === null ? '' : formatarDecimal(valor);
  return (
    <Moldura id={id} prefixo="R$" {...moldura}>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        className={CLASSE_INPUT}
        value={exibido}
        onChange={(e) => {
          const novo = mascaraParaDinheiro(e.target.value);
          // Apagando até zerar: deixa o campo vazio em vez de travar em "0,00"
          const apagando = e.target.value.length < exibido.length;
          aoMudar(apagando && novo === 0 ? null : novo);
        }}
        aria-invalid={Boolean(moldura.erro)}
        aria-describedby={moldura.erro || moldura.ajuda ? `${id}-msg` : undefined}
      />
    </Moldura>
  );
}

/** Inteiro com separador de milhar (km, meses). */
export function CampoInteiro({
  valor,
  aoMudar,
  sufixo,
  maxDigitos,
  placeholder,
  ...moldura
}: CampoNumerico & { sufixo?: string; maxDigitos?: number; placeholder?: string }) {
  const id = useId();
  return (
    <Moldura id={id} sufixo={sufixo} {...moldura}>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        className={CLASSE_INPUT}
        value={valor === null ? '' : formatarInteiro(valor)}
        onChange={(e) => aoMudar(mascaraParaInteiro(e.target.value, maxDigitos))}
        aria-invalid={Boolean(moldura.erro)}
        aria-describedby={moldura.erro || moldura.ajuda ? `${id}-msg` : undefined}
      />
    </Moldura>
  );
}

export function CampoTexto({
  valor,
  aoMudar,
  placeholder,
  ...moldura
}: PropsMoldura & { valor: string; aoMudar: (v: string) => void; placeholder?: string }) {
  const id = useId();
  return (
    <Moldura id={id} {...moldura}>
      <input
        id={id}
        type="text"
        maxLength={80}
        placeholder={placeholder}
        className={CLASSE_INPUT}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        aria-invalid={Boolean(moldura.erro)}
        aria-describedby={moldura.erro || moldura.ajuda ? `${id}-msg` : undefined}
      />
    </Moldura>
  );
}
