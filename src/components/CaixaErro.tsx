// Caixa de erro do diagnóstico com as ações possíveis.
import type { ErroDiagnostico } from '../services/erros';
import { Botao } from './Botao';
import { IconeAlerta, IconeChave, IconeRecarregar } from './Icones';

interface Props {
  erro: ErroDiagnostico;
  aoTentarDeNovo: () => void;
  aoUsarDemonstracao: () => void;
}

export function CaixaErro({ erro, aoTentarDeNovo, aoUsarDemonstracao }: Props) {
  return (
    <div role="alert" className="overflow-hidden rounded-2xl border-2 border-perigo/40 bg-superficie">
      <div className="h-2 zebrado" />
      <div className="flex flex-col gap-4 p-5">
        <div className="flex gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-perigo/15 text-perigo">
            <IconeAlerta />
          </span>
          <div>
            <h3 className="text-xl font-bold">{erro.titulo}</h3>
            <p className="mt-1 text-sm text-suave">{erro.message}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Botao onClick={aoTentarDeNovo}>
            <IconeRecarregar tamanho={18} /> Tentar de novo
          </Botao>
          {erro.tipo === 'chave' && (
            <Botao variante="secundario" href="#/config">
              <IconeChave tamanho={18} /> Revisar a chave
            </Botao>
          )}
          <Botao variante="fantasma" onClick={aoUsarDemonstracao}>
            Ver diagnóstico de demonstração
          </Botao>
        </div>
      </div>
    </div>
  );
}
