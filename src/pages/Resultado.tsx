// Resultado: indicadores calculados no código + diagnóstico (IA ou demonstração).
import { useMemo } from 'react';
import type { Indicadores } from '../types';
import { Botao } from '../components/Botao';
import { CaixaErro } from '../components/CaixaErro';
import { CartaoIndicador, type Tom } from '../components/CartaoIndicador';
import { ComposicaoReceita } from '../components/ComposicaoReceita';
import { EsqueletoDiagnostico } from '../components/Esqueleto';
import { PainelDiagnostico } from '../components/PainelDiagnostico';
import { SeloStatus } from '../components/SeloStatus';
import {
  IconeAlvo,
  IconeBrilho,
  IconeChave,
  IconeCombustivel,
  IconeEstrada,
  IconeLapis,
  IconeMais,
  IconeRelogio,
} from '../components/Icones';
import { useChaveGemini } from '../hooks/useChaveGemini';
import { useDiagnostico } from '../hooks/useDiagnostico';
import { obterSimulacao } from '../services/historico';
import { calcularIndicadores, resumoStatus } from '../utils/calculos';
import {
  formatarData,
  formatarMeses,
  formatarMoeda,
  formatarPercentual,
  formatarPorKm,
} from '../utils/formatacao';
import { NaoEncontrada } from './NaoEncontrada';

/** Cor do valor conforme o sinal (positivo = bom). */
function tomSinal(valor: number): Tom {
  return valor > 0 ? 'bom' : valor < 0 ? 'ruim' : 'neutro';
}

/** Verde só acima de 25%; entre 10% e 25% é razoável, então fica neutra. */
function tomMargem(margem: number): Tom {
  if (margem < 0) return 'ruim';
  if (margem < 10) return 'atencao';
  if (margem <= 25) return 'neutro';
  return 'bom';
}

function tomDiesel(peso: number): Tom {
  if (peso >= 45) return 'ruim';
  if (peso >= 35) return 'atencao';
  return 'bom';
}

const COR_FAIXA = { viavel: 'bg-ok', ajuste: 'bg-atencao', inviavel: 'bg-perigo' };

export function Resultado({ id }: { id: string }) {
  // Lê uma vez por id; o diagnóstico é salvo no histórico pelo hook
  const sim = useMemo(() => obterSimulacao(id), [id]);
  const { chave, temChave } = useChaveGemini();
  const diag = useDiagnostico(sim, chave);

  if (!sim) {
    return <NaoEncontrada texto="Essa simulação não existe mais. Ela pode ter sido excluída do histórico." />;
  }

  const e = sim.entradas;
  const ind: Indicadores = calcularIndicadores(e);

  return (
    <div className="flex flex-col gap-8">
      {/* Cabeçalho do resultado */}
      <div className="flex flex-col gap-2">
        <p className="text-sm text-suave">Simulação de {formatarData(sim.criadoEm)}</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-extrabold [overflow-wrap:anywhere]">{e.metaNome}</h1>
          <SeloStatus status={ind.status} grande />
        </div>
      </div>

      {/* Destaque: sobra do mês × parcela da meta */}
      <section className="asfalto relative overflow-hidden rounded-3xl p-6 text-white sm:p-8">
        <div className={`absolute inset-x-0 top-0 h-1.5 ${COR_FAIXA[ind.status]}`} />
        <div className="grid gap-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <div>
            <p className="text-sm font-medium text-white/60">Sobra no fim do mês</p>
            <p className={`font-titulo text-5xl font-extrabold tabular-nums ${ind.sobraMensal >= 0 ? 'text-white' : 'text-red-400'}`}>
              {formatarMoeda(ind.sobraMensal)}
            </p>
          </div>
          <div className="hidden h-16 w-px bg-white/15 sm:block" />
          <div>
            <p className="text-sm font-medium text-white/60">A meta pede por mês</p>
            <p className="font-titulo text-5xl font-extrabold tabular-nums text-sinal">{formatarMoeda(ind.guardarPorMes)}</p>
          </div>
        </div>
        {/* Medidor: quanto da parcela da meta a sobra cobre */}
        <div className="mt-6">
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full ${COR_FAIXA[ind.status]}`}
              style={{ width: `${Math.min(100, ind.coberturaMeta)}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-white/80">
            <strong className="text-white">A sobra cobre {formatarPercentual(Math.min(999, ind.coberturaMeta))} da meta mensal.</strong>{' '}
            {resumoStatus(e, ind)}
          </p>
        </div>
      </section>

      {/* Indicadores calculados */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Indicadores do mês</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <CartaoIndicador
            rotulo="Lucro operacional"
            valor={formatarMoeda(ind.lucroOperacional)}
            detalhe="Receita menos custos da estrada e fixos do caminhão."
            tom={tomSinal(ind.lucroOperacional)}
          />
          <CartaoIndicador
            rotulo="Sobra mensal"
            valor={formatarMoeda(ind.sobraMensal)}
            detalhe={`Lucro menos a retirada de ${formatarMoeda(e.retirada)}.`}
            tom={tomSinal(ind.sobraMensal)}
          />
          <CartaoIndicador
            rotulo="Margem"
            valor={formatarPercentual(ind.margem)}
            detalhe="Quanto de cada R$ 100 de frete vira lucro."
            tom={tomMargem(ind.margem)}
          />
          <CartaoIndicador
            rotulo="Receita por km"
            icone={<IconeEstrada tamanho={14} />}
            valor={formatarPorKm(ind.receitaPorKm)}
            detalhe="Quanto cada km rodado fatura."
          />
          <CartaoIndicador
            rotulo="Custo por km"
            icone={<IconeEstrada tamanho={14} />}
            valor={formatarPorKm(ind.custoPorKm)}
            detalhe="Quanto cada km custa, somando tudo."
          />
          <CartaoIndicador
            rotulo="Lucro por km"
            icone={<IconeEstrada tamanho={14} />}
            valor={formatarPorKm(ind.lucroPorKm)}
            detalhe="O que sobra de cada km para o negócio."
            tom={tomSinal(ind.lucroPorKm)}
          />
          <CartaoIndicador
            rotulo="Peso do diesel"
            icone={<IconeCombustivel tamanho={14} />}
            valor={formatarPercentual(ind.pesoDiesel)}
            detalhe="Parte da receita que vai para diesel e Arla."
            tom={tomDiesel(ind.pesoDiesel)}
          />
          <CartaoIndicador
            rotulo="Guardar por mês"
            icone={<IconeAlvo tamanho={14} />}
            valor={formatarMoeda(ind.guardarPorMes)}
            detalhe={`${formatarMoeda(e.metaValor)} em ${formatarMeses(e.metaPrazo)}.`}
          />
          <CartaoIndicador
            rotulo="Prazo realista"
            icone={<IconeRelogio tamanho={14} />}
            valor={ind.prazoRealista ? formatarMeses(ind.prazoRealista) : 'Sem sobra'}
            detalhe={
              ind.prazoRealista
                ? 'Guardando toda a sobra do mês.'
                : 'Com sobra zero ou negativa, a meta não avança.'
            }
            tom={ind.prazoRealista === null ? 'ruim' : ind.prazoRealista <= e.metaPrazo ? 'bom' : 'atencao'}
          />
        </div>
      </section>

      <ComposicaoReceita e={e} ind={ind} />

      {/* Diagnóstico */}
      <section className="flex flex-col gap-4" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <IconeBrilho className="text-sinal" /> Diagnóstico
          </h2>
          {/* Atalho do modo demonstração. Diagnóstico da IA não é pedido de novo (evita gastar a cota). */}
          {diag.fase === 'pronto' &&
            diag.diagnostico?.origem === 'demo' &&
            (temChave ? (
              <Botao className="text-xs" onClick={() => diag.gerar()} disabled={diag.carregando}>
                <IconeBrilho tamanho={16} /> Gerar com IA
              </Botao>
            ) : (
              <Botao href="#/config" variante="secundario" className="text-xs">
                <IconeChave tamanho={16} /> Cadastrar chave
              </Botao>
            ))}
        </div>

        {diag.fase === 'carregando' && (
          <>
            <p className="text-sm text-suave">
              {temChave ? 'O Gemini está analisando seus números…' : 'Montando o diagnóstico de demonstração…'}
            </p>
            <EsqueletoDiagnostico />
          </>
        )}
        {diag.fase === 'erro' && diag.erro && (
          <CaixaErro erro={diag.erro} aoTentarDeNovo={() => diag.gerar()} aoUsarDemonstracao={() => diag.gerar('demo')} />
        )}
        {diag.fase === 'pronto' && diag.diagnostico && <PainelDiagnostico d={diag.diagnostico} />}
      </section>

      <div className="flex flex-wrap gap-3 border-t border-borda pt-6">
        <Botao href={`#/simular/${sim.id}`} variante="secundario">
          <IconeLapis tamanho={18} /> Ajustar números
        </Botao>
        <Botao href="#/simular">
          <IconeMais tamanho={18} /> Nova simulação
        </Botao>
        <Botao href="#/historico" variante="fantasma">
          <IconeRelogio tamanho={18} /> Histórico
        </Botao>
      </div>
    </div>
  );
}
