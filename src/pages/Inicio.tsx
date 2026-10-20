// Página inicial: apresenta o app e leva para a simulação.
import { Botao } from '../components/Botao';
import { IconeBrilho, IconeCadeado, IconeCaminhao, IconeGrafico, IconeRelogio, IconeSetaDireita } from '../components/Icones';
import { useChaveGemini } from '../hooks/useChaveGemini';
import { listarSimulacoes } from '../services/historico';

const RECURSOS = [
  {
    Icone: IconeGrafico,
    titulo: 'Números na ponta do lápis',
    texto: 'Lucro, custo por km, peso do diesel e sobra do mês calculados pelo app — nada de chute.',
  },
  {
    Icone: IconeBrilho,
    titulo: 'Diagnóstico com IA',
    texto: 'O Gemini lê seus números e devolve dicas para gastar menos, faturar mais e montar a reserva.',
  },
  {
    Icone: IconeCadeado,
    titulo: 'Seus dados ficam com você',
    texto: 'Sem cadastro e sem servidor: tudo fica salvo só neste navegador.',
  },
];

export function Inicio() {
  const { temChave } = useChaveGemini();
  const total = listarSimulacoes().length;

  return (
    <div className="flex flex-col gap-10">
      {/* Destaque principal com visual de asfalto */}
      <section className="asfalto relative overflow-hidden rounded-3xl px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="absolute inset-x-0 bottom-6 h-1.5 faixa-pista opacity-70" />
        <IconeCaminhao
          tamanho={220}
          strokeWidth={1}
          className="pointer-events-none absolute -bottom-8 -right-10 text-white/5 sm:right-4"
        />
        <div className="relative flex max-w-2xl flex-col gap-5">
          <span className="w-fit rounded-full border border-sinal/40 bg-sinal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sinal">
            Planejador financeiro do caminhoneiro
          </span>
          <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-6xl">
            O frete paga a estrada.
            <br />
            <span className="text-sinal">Sobra para o seu sonho?</span>
          </h1>
          <p className="max-w-xl text-base text-white/75 sm:text-lg">
            Em 4 passos você coloca receita e custos do mês, descobre quanto realmente lucra por km e recebe um plano
            para chegar na sua meta.
          </p>
          <div className="flex flex-wrap gap-3 pb-6">
            <Botao href="#/simular" className="px-6 text-base">
              Começar simulação <IconeSetaDireita tamanho={18} />
            </Botao>
            {total > 0 && (
              <Botao href="#/historico" variante="fantasma" className="text-white/80 hover:bg-white/10 hover:text-white">
                <IconeRelogio tamanho={18} /> Ver histórico ({total})
              </Botao>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {RECURSOS.map(({ Icone, titulo, texto }) => (
          <div key={titulo} className="flex flex-col gap-2 rounded-2xl border border-borda bg-superficie p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-sinal text-asfalto">
              <Icone tamanho={20} />
            </span>
            <h2 className="mt-1 text-xl font-bold">{titulo}</h2>
            <p className="text-sm leading-relaxed text-suave">{texto}</p>
          </div>
        ))}
      </section>

      {!temChave && (
        <section className="flex flex-col items-start gap-3 rounded-2xl border-2 border-dashed border-borda p-5 sm:flex-row sm:items-center">
          <p className="flex-1 text-sm text-suave">
            <strong className="text-texto">Você está no modo demonstração.</strong> O app funciona completo, com um
            diagnóstico gerado por regras locais. Para a análise com IA, use sua chave gratuita do Gemini.
          </p>
          <Botao href="#/config" variante="secundario">
            Configurar chave
          </Botao>
        </section>
      )}
    </div>
  );
}
