// Estrutura geral e roteamento por hash.
import { Cabecalho } from './components/Cabecalho';
import { useRota } from './hooks/useRota';
import { Configuracoes } from './pages/Configuracoes';
import { Historico } from './pages/Historico';
import { Inicio } from './pages/Inicio';
import { NaoEncontrada } from './pages/NaoEncontrada';
import { Resultado } from './pages/Resultado';
import { Simulador } from './pages/Simulador';

/** Escolhe a página pela rota: #/, #/simular[/id], #/resultado/id, #/historico, #/config */
function Pagina({ rota }: { rota: string }) {
  const [secao, parametro] = rota.split('/').filter(Boolean);

  switch (secao) {
    case undefined:
      return <Inicio />;
    case 'simular':
      // key força começar do zero ao trocar de simulação base
      return <Simulador key={parametro ?? 'nova'} idBase={parametro} />;
    case 'resultado':
      return parametro ? <Resultado key={parametro} id={parametro} /> : <NaoEncontrada />;
    case 'historico':
      return <Historico />;
    case 'config':
      return <Configuracoes />;
    default:
      return <NaoEncontrada />;
  }
}

export default function App() {
  const rota = useRota();

  return (
    // overflow-x-clip: garantia extra de que nada cria rolagem lateral no celular
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <Cabecalho rota={rota} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-10">
        <Pagina rota={rota} />
      </main>
      <footer className="border-t border-borda">
        <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-6 text-xs text-suave sm:flex-row sm:justify-between">
          <p>FreteCerto · seus dados ficam só neste navegador.</p>
          <p>Orientação financeira educativa. Não substitui um contador.</p>
        </div>
      </footer>
    </div>
  );
}
