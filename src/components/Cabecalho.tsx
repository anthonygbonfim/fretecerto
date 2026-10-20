// Cabeçalho com logo, navegação e botão de tema.
import { useTema } from '../hooks/useTema';
import { useChaveGemini } from '../hooks/useChaveGemini';
import { IconeCaminhao, IconeEngrenagem, IconeLua, IconeMais, IconeRelogio, IconeSol } from './Icones';

const LINKS = [
  { href: '#/simular', rotulo: 'Simular', Icone: IconeMais, prefixo: '/simular' },
  { href: '#/historico', rotulo: 'Histórico', Icone: IconeRelogio, prefixo: '/historico' },
  { href: '#/config', rotulo: 'Configurações', Icone: IconeEngrenagem, prefixo: '/config' },
];

export function Cabecalho({ rota }: { rota: string }) {
  const { tema, alternar } = useTema();
  const { temChave } = useChaveGemini();

  return (
    <header className="sticky top-0 z-20 asfalto text-white">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">
        <a href="#/" className="flex items-center gap-2.5 rounded-lg pr-2" aria-label="FreteCerto, página inicial">
          <span className="grid size-9 place-items-center rounded-lg bg-sinal text-asfalto">
            <IconeCaminhao tamanho={22} />
          </span>
          <span className="font-titulo text-2xl font-bold leading-none">
            Frete<span className="text-sinal">Certo</span>
          </span>
        </a>

        <nav className="ml-auto flex items-center gap-1" aria-label="Principal">
          {LINKS.map(({ href, rotulo, Icone, prefixo }) => {
            const ativo = rota.startsWith(prefixo);
            return (
              <a
                key={href}
                href={href}
                aria-current={ativo ? 'page' : undefined}
                title={rotulo}
                className={`relative flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition-colors sm:px-3 ${
                  ativo ? 'bg-white/10 text-sinal' : 'text-white/75 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icone tamanho={18} />
                <span className="sr-only sm:not-sr-only">{rotulo}</span>
                {/* Pontinho avisando que está no modo demonstração */}
                {prefixo === '/config' && !temChave && (
                  <span className="absolute right-1 top-1.5 size-2 rounded-full bg-sinal" aria-label="modo demonstração" />
                )}
              </a>
            );
          })}

          <button
            type="button"
            onClick={alternar}
            className="ml-1 grid size-10 cursor-pointer place-items-center rounded-lg text-white/75 transition-colors hover:bg-white/5 hover:text-sinal"
            aria-label={tema === 'escuro' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            title={tema === 'escuro' ? 'Tema claro' : 'Tema escuro'}
          >
            {tema === 'escuro' ? <IconeSol tamanho={19} /> : <IconeLua tamanho={19} />}
          </button>
        </nav>
      </div>
      {/* Faixa amarela tracejada, como a do meio da pista */}
      <div className="h-1 faixa-pista opacity-90" />
    </header>
  );
}
