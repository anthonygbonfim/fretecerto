// Formulário em 4 etapas. Ao concluir, salva a simulação e abre o resultado.
import { useRef, useState, type FormEvent } from 'react';
import type { DadosFormulario } from '../types';
import { ETAPAS } from '../data/etapas';
import { EXEMPLO, FORMULARIO_VAZIO } from '../data/exemplo';
import { BarraProgresso } from '../components/BarraProgresso';
import { Botao } from '../components/Botao';
import { CampoDinheiro, CampoInteiro, CampoTexto } from '../components/Campos';
import { IconeCheck, IconeLampada, IconeSetaDireita, IconeSetaEsquerda } from '../components/Icones';
import { criarSimulacao, obterSimulacao } from '../services/historico';
import { navegar } from '../hooks/useRota';
import { paraEntradas, paraFormulario, primeiraEtapaComErro, validarEtapa, type Erros } from '../utils/validacao';
import { formatarMoeda } from '../utils/formatacao';

export function Simulador({ idBase }: { idBase?: string }) {
  // Se veio de "Ajustar números", começa com os dados daquela simulação
  const [dados, setDados] = useState<DadosFormulario>(() => {
    const base = idBase ? obterSimulacao(idBase) : null;
    return base ? paraFormulario(base.entradas) : FORMULARIO_VAZIO;
  });
  const [etapa, setEtapa] = useState(0);
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);
  const topoRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const ultima = etapa === ETAPAS.length - 1;

  /** Atualiza um campo e apaga o erro dele. */
  function alterar<K extends keyof DadosFormulario>(campo: K, valor: DadosFormulario[K]) {
    setDados((d) => ({ ...d, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  }

  function irPara(nova: number) {
    setEtapa(nova);
    setErros({});
    topoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Mostra os erros e coloca o foco no primeiro campo com problema. */
  function mostrarErros(encontrados: Erros) {
    setErros(encontrados);
    // Espera a tela atualizar para o campo já estar marcado com aria-invalid
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus();
    });
  }

  function avancar(ev: FormEvent) {
    ev.preventDefault();
    const encontrados = validarEtapa(etapa, dados);
    if (Object.keys(encontrados).length > 0) {
      mostrarErros(encontrados);
      return;
    }
    if (!ultima) {
      irPara(etapa + 1);
      return;
    }
    // Última etapa: confere tudo de novo antes de salvar
    const comErro = primeiraEtapaComErro(dados);
    if (comErro >= 0) {
      irPara(comErro);
      mostrarErros(validarEtapa(comErro, dados));
      return;
    }
    if (enviando) return;
    setEnviando(true);
    const id = criarSimulacao(paraEntradas(dados));
    navegar(`/resultado/${id}`);
  }

  function preencherExemplo() {
    setDados(EXEMPLO);
    setErros({});
  }

  // Prévia do total da etapa, para a pessoa conferir enquanto digita
  const totalEstrada = (dados.diesel ?? 0) + (dados.pedagios ?? 0) + (dados.manutencao ?? 0);
  const totalFixos = (dados.custosFixos ?? 0) + (dados.parcelas ?? 0) + (dados.retirada ?? 0);

  return (
    <div ref={topoRef} className="mx-auto flex max-w-2xl scroll-mt-24 flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-sinal-forte dark:text-sinal">Nova simulação</p>
          <h1 className="text-4xl font-extrabold">{ETAPAS[etapa].titulo}</h1>
        </div>
        <Botao variante="secundario" onClick={preencherExemplo} className="text-xs">
          <IconeLampada tamanho={16} /> Preencher com exemplo
        </Botao>
      </div>

      <BarraProgresso etapa={etapa} aoIrPara={irPara} />

      <form ref={formRef} onSubmit={avancar} noValidate className="flex flex-col gap-6 rounded-3xl border border-borda bg-superficie p-5 sm:p-7">
        <p className="text-suave">{ETAPAS[etapa].descricao}</p>

        {etapa === 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <CampoDinheiro
              rotulo="Receita de fretes no mês"
              ajuda="Tudo o que você recebeu de frete, antes de pagar os custos."
              placeholder="18.000,00"
              valor={dados.receita}
              aoMudar={(v) => alterar('receita', v)}
              erro={erros.receita}
            />
            <CampoInteiro
              rotulo="Km rodados no mês"
              ajuda="Conte também os km em que você voltou sem carga."
              sufixo="km"
              placeholder="9000"
              valor={dados.km}
              aoMudar={(v) => alterar('km', v)}
              erro={erros.km}
            />
          </div>
        )}

        {etapa === 1 && (
          <div className="grid gap-5">
            <CampoDinheiro
              rotulo="Diesel e Arla 32"
              placeholder="7.500,00"
              valor={dados.diesel}
              aoMudar={(v) => alterar('diesel', v)}
              erro={erros.diesel}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <CampoDinheiro
                rotulo="Pedágios"
                opcional
                ajuda="Deixe vazio se o embarcador paga o vale-pedágio."
                placeholder="1.200,00"
                valor={dados.pedagios}
                aoMudar={(v) => alterar('pedagios', v)}
              />
              <CampoDinheiro
                rotulo="Manutenção"
                ajuda="Pneus, óleo, peças, lavagem — média do mês."
                placeholder="1.500,00"
                valor={dados.manutencao}
                aoMudar={(v) => alterar('manutencao', v)}
                erro={erros.manutencao}
              />
            </div>
            <Total rotulo="Custos da estrada" valor={totalEstrada} />
          </div>
        )}

        {etapa === 2 && (
          <div className="grid gap-5">
            <CampoDinheiro
              rotulo="Seguro, rastreador, IPVA e contador"
              ajuda="Some as contas fixas do mês (IPVA e licenciamento: divida o valor do ano por 12)."
              placeholder="1.300,00"
              valor={dados.custosFixos}
              aoMudar={(v) => alterar('custosFixos', v)}
              erro={erros.custosFixos}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <CampoDinheiro
                rotulo="Parcela do caminhão"
                opcional
                ajuda="Deixe vazio se o caminhão já está quitado."
                placeholder="3.200,00"
                valor={dados.parcelas}
                aoMudar={(v) => alterar('parcelas', v)}
              />
              <CampoDinheiro
                rotulo="Retirada para a casa"
                ajuda="Seu 'salário': o que vai para a família no mês."
                placeholder="2.500,00"
                valor={dados.retirada}
                aoMudar={(v) => alterar('retirada', v)}
                erro={erros.retirada}
              />
            </div>
            <Total rotulo="Fixos + retirada" valor={totalFixos} />
          </div>
        )}

        {etapa === 3 && (
          <div className="grid gap-5">
            <CampoTexto
              rotulo="Qual é a sua meta?"
              placeholder="Ex.: trocar os pneus, dar entrada na casa…"
              valor={dados.metaNome}
              aoMudar={(v) => alterar('metaNome', v)}
              erro={erros.metaNome}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <CampoDinheiro
                rotulo="Valor da meta"
                placeholder="12.000,00"
                valor={dados.metaValor}
                aoMudar={(v) => alterar('metaValor', v)}
                erro={erros.metaValor}
              />
              <CampoInteiro
                rotulo="Prazo"
                ajuda="De 1 a 120 meses (10 anos)."
                sufixo="meses"
                placeholder="6"
                maxDigitos={3}
                valor={dados.metaPrazo}
                aoMudar={(v) => alterar('metaPrazo', v)}
                erro={erros.metaPrazo}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-borda pt-5">
          <Botao variante="fantasma" onClick={() => irPara(etapa - 1)} disabled={etapa === 0}>
            <IconeSetaEsquerda tamanho={18} /> Voltar
          </Botao>
          <Botao type="submit" disabled={enviando} className="px-6">
            {ultima ? (
              <>
                Ver resultado <IconeCheck tamanho={18} />
              </>
            ) : (
              <>
                Avançar <IconeSetaDireita tamanho={18} />
              </>
            )}
          </Botao>
        </div>
      </form>
    </div>
  );
}

function Total({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-superficie-2 px-4 py-3 text-sm">
      <span className="text-suave">{rotulo}</span>
      <span className="font-titulo text-xl font-bold tabular-nums">{formatarMoeda(valor)}</span>
    </div>
  );
}
