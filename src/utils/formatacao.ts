// Formatação de números no padrão brasileiro e máscaras de digitação.

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const decimal2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const percentual = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Limite de dígitos nos campos de dinheiro (até 999.999.999,99). */
const MAX_DIGITOS_DINHEIRO = 11;

/** 1234.5 → "R$ 1.234,50" */
export function formatarMoeda(valor: number): string {
  return moeda.format(valor);
}

/** 1234.5 → "1.234,50" (sem o "R$", usado dentro do campo) */
export function formatarDecimal(valor: number): string {
  return decimal2.format(valor);
}

/** 12000 → "12.000" */
export function formatarInteiro(valor: number): string {
  return inteiro.format(valor);
}

/** 23.456 → "23,5%" */
export function formatarPercentual(valor: number): string {
  return `${percentual.format(valor)}%`;
}

/** Valor por km, com centavos: "R$ 4,73/km" */
export function formatarPorKm(valor: number): string {
  return `${moeda.format(valor)}/km`;
}

/** 14 → "14 meses (1 ano e 2 meses)" */
export function formatarMeses(meses: number): string {
  const base = meses === 1 ? '1 mês' : `${meses} meses`;
  if (meses < 12) return base;
  const anos = Math.floor(meses / 12);
  const resto = meses % 12;
  const textoAnos = anos === 1 ? '1 ano' : `${anos} anos`;
  if (resto === 0) return `${base} (${textoAnos})`;
  return `${base} (${textoAnos} e ${resto === 1 ? '1 mês' : `${resto} meses`})`;
}

/** Data ISO → "20/10/2026 às 15:40" */
export function formatarData(iso: string): string {
  const d = new Date(iso);
  const data = d.toLocaleDateString('pt-BR');
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${data} às ${hora}`;
}

/**
 * Máscara de dinheiro: a pessoa digita só números e eles entram pela direita,
 * como numa maquininha. "123456" → 1234.56. Texto sem dígitos → null.
 */
export function mascaraParaDinheiro(texto: string): number | null {
  const todos = texto.replace(/\D/g, '');
  if (todos === '') return null;
  // Remove zeros à esquerda e limita o tamanho (dígitos extras são ignorados)
  const digitos = todos.replace(/^0+/, '').slice(0, MAX_DIGITOS_DINHEIRO);
  return Number(digitos || '0') / 100;
}

/** Máscara de inteiro (km, meses): "12.0a00" → 12000. */
export function mascaraParaInteiro(texto: string, maxDigitos = 7): number | null {
  const digitos = texto.replace(/\D/g, '').slice(0, maxDigitos);
  if (digitos === '') return null;
  return Number(digitos);
}
