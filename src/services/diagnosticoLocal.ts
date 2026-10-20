// Modo demonstração: gera o diagnóstico com regras locais, sem IA e sem internet.
// Devolve exatamente o mesmo formato do diagnóstico do Gemini.
import type { Diagnostico, Entradas, Indicadores } from '../types';
import { formatarMeses, formatarMoeda, formatarPercentual, formatarPorKm } from '../utils/formatacao';

/** Pega as 4 primeiras dicas cuja condição é verdadeira. */
function escolher(opcoes: [boolean, string][]): string[] {
  return opcoes.filter(([cond]) => cond).map(([, texto]) => texto).slice(0, 4);
}

function textoViabilidade(e: Entradas, ind: Indicadores): string {
  const parcela = formatarMoeda(ind.guardarPorMes);
  if (ind.status === 'viavel') {
    return `Dá para chegar lá. Você precisa guardar ${parcela} por mês e hoje sobram ${formatarMoeda(ind.sobraMensal)}. O segredo é separar esse dinheiro assim que o frete cair.`;
  }
  if (ind.status === 'ajuste') {
    return `Está perto. Faltam ${formatarMoeda(ind.faltaPorMes)} por mês para fechar a conta da meta. Um pequeno corte de custo ou um frete a mais resolve.`;
  }
  if (ind.sobraMensal <= 0) {
    return `Do jeito que está, a meta não cabe: o mês fecha sem sobra. Primeiro é preciso equilibrar custos e receita.`;
  }
  return `No prazo de ${formatarMeses(e.metaPrazo)} a meta não cabe na sua sobra. ${
    ind.prazoRealista ? `Guardando toda a sobra, o prazo realista é de ${formatarMeses(ind.prazoRealista)}.` : ''
  }`.trim();
}

function textoDiagnostico(e: Entradas, ind: Indicadores): string {
  const partes: string[] = [];

  if (ind.lucroOperacional <= 0) {
    partes.push(`Seu caminhão está custando mais do que fatura: o lucro operacional ficou em ${formatarMoeda(ind.lucroOperacional)}.`);
  } else if (ind.margem < 10) {
    partes.push(`Sua margem de ${formatarPercentual(ind.margem)} está apertada: qualquer imprevisto na estrada come o lucro do mês.`);
  } else if (ind.margem < 20) {
    partes.push(`Sua margem de ${formatarPercentual(ind.margem)} é razoável, mas ainda tem espaço para melhorar.`);
  } else {
    partes.push(`Sua margem de ${formatarPercentual(ind.margem)} é boa para o transporte rodoviário.`);
  }

  partes.push(
    `Cada km rende ${formatarMoeda(ind.receitaPorKm)} e custa ${formatarMoeda(ind.custoPorKm)}, deixando ${formatarMoeda(ind.lucroPorKm)} de lucro.`,
  );

  if (ind.pesoDiesel >= 45) {
    partes.push(`O diesel engole ${formatarPercentual(ind.pesoDiesel)} do faturamento — é o primeiro lugar para atacar.`);
  } else if (ind.pesoDiesel >= 35) {
    partes.push(`O diesel pesa ${formatarPercentual(ind.pesoDiesel)} da receita, dentro do comum, mas merece atenção.`);
  } else {
    partes.push(`O diesel pesa ${formatarPercentual(ind.pesoDiesel)} da receita, um peso controlado.`);
  }

  if (e.parcelas > 0 && e.parcelas / e.receita > 0.12) {
    partes.push(`As parcelas do caminhão também pesam bastante no mês.`);
  }

  partes.push(
    ind.sobraMensal > 0
      ? `Depois da retirada para casa, sobram ${formatarMoeda(ind.sobraMensal)} por mês.`
      : `Depois da retirada para casa, o mês fecha no vermelho em ${formatarMoeda(Math.abs(ind.sobraMensal))}.`,
  );

  return partes.join(' ');
}

export function gerarDiagnosticoLocal(e: Entradas, ind: Indicadores): Diagnostico {
  const dieselAlto = ind.pesoDiesel >= 35;
  const temPedagio = e.pedagios > 0;
  const temParcela = e.parcelas > 0;
  const manutencaoAlta = e.manutencao / Math.max(e.receita, 1) > 0.1;

  // Reserva de emergência sugerida: 3 meses de custos fixos + retirada
  const reservaSugerida = (ind.custosFixosTotais + e.retirada) * 3;
  // Quanto separar por km para manutenção e pneus (média do mês informado)
  const manutencaoPorKm = e.km > 0 ? e.manutencao / e.km : 0;

  return {
    viabilidade: { status: ind.status, texto: textoViabilidade(e, ind) },
    diagnostico: textoDiagnostico(e, ind),
    dicasEconomia: escolher([
      [dieselAlto, 'Mantenha velocidade constante entre 80 e 90 km/h e evite acelerar forte em subida: o consumo de diesel cai bastante.'],
      [dieselAlto, 'Calibre os pneus toda semana. Pneu murcho aumenta o consumo e gasta a borracha antes da hora.'],
      [true, 'Abasteça em postos de rede com desconto para caminhoneiro e anote cada abastecimento para descobrir sua média real de km/l.'],
      [temPedagio, 'Compare rotas antes de sair: às vezes uma rota com menos praças de pedágio compensa alguns km a mais.'],
      [manutencaoAlta, 'Faça manutenção preventiva no prazo. Quebra na estrada custa guincho, peça cara e dias parado sem faturar.'],
      [temParcela, 'Pesquise renegociar ou fazer portabilidade das parcelas do caminhão para uma taxa de juros menor.'],
      [true, 'Faça cotação do seguro e do rastreador todo ano: trocar de empresa pode baixar bem a conta fixa.'],
      [true, 'Evite rodar vazio: cada km sem carga é diesel, pneu e pedágio pagos do seu bolso.'],
    ]),
    ideiasReceita: [
      'Nunca volte vazio: procure frete de retorno antes mesmo de descarregar, em aplicativos de carga e com transportadoras da região.',
      'Use o piso mínimo de frete da ANTT como base na hora de negociar e não aceite valor abaixo dele.',
      'Cobre a estadia quando a espera para carregar ou descarregar passar de 5 horas, como prevê a lei do transporte de cargas.',
      'Busque contratos fixos com embarcadores da sua rota: receita mais previsível e menos tempo procurando carga.',
    ],
    dicasReserva: [
      'Abra uma conta só para a reserva e transfira o dinheiro no mesmo dia em que o frete cair, antes de gastar.',
      `Monte uma reserva de emergência de pelo menos ${formatarMoeda(reservaSugerida)}, o equivalente a 3 meses de custos fixos e retirada.`,
      manutencaoPorKm > 0
        ? `Separe cerca de ${formatarPorKm(manutencaoPorKm)} rodado para manutenção e pneus. Assim a troca não pega você desprevenido.`
        : 'Separe um valor fixo por km rodado para manutenção e pneus. Assim a troca não pega você desprevenido.',
      'Deixe a reserva em aplicação de liquidez diária e baixo risco, como Tesouro Selic ou CDB com resgate diário.',
    ],
    mensagemMotivacional:
      ind.status === 'viavel'
        ? `"${e.metaNome}" está no seu caminho. Mantenha o ritmo e o controle, que essa conquista chega!`
        : `"${e.metaNome}" é possível: com alguns ajustes no trajeto, você chega lá. Cada km bem planejado conta.`,
    origem: 'demo',
    geradoEm: new Date().toISOString(),
  };
}
