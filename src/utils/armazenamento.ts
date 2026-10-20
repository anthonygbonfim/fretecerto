// Leitura e gravação seguras no localStorage.
// O acesso pode falhar (modo privado, armazenamento cheio), por isso tudo fica em try/catch.

export const CHAVES = {
  historico: 'fretecerto:historico',
  tema: 'fretecerto:tema',
  chaveGemini: 'fretecerto:chave-gemini',
} as const;

export function ler<T>(chave: string, padrao: T): T {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto === null ? padrao : (JSON.parse(bruto) as T);
  } catch {
    return padrao;
  }
}

export function gravar(chave: string, valor: unknown): boolean {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

export function remover(chave: string): void {
  try {
    localStorage.removeItem(chave);
  } catch {
    // Sem acesso ao armazenamento: não há o que remover.
  }
}

/** Gera um id curto e único para cada simulação. */
export function gerarId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
