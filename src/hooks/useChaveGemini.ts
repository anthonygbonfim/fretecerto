// Chave do Gemini salva só no navegador (localStorage).
// Usa useSyncExternalStore para todas as telas verem a mudança na hora.
import { useSyncExternalStore } from 'react';
import { CHAVES, gravar, ler, remover } from '../utils/armazenamento';

const ouvintes = new Set<() => void>();

function avisar() {
  ouvintes.forEach((f) => f());
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  // "storage" avisa quando a chave muda em outra aba
  window.addEventListener('storage', ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
    window.removeEventListener('storage', ouvinte);
  };
}

function lerChave(): string {
  const valor = ler<unknown>(CHAVES.chaveGemini, '');
  return typeof valor === 'string' ? valor : '';
}

export function useChaveGemini() {
  const chave = useSyncExternalStore(assinar, lerChave);

  return {
    chave,
    temChave: chave.trim() !== '',
    salvar(nova: string) {
      gravar(CHAVES.chaveGemini, nova.trim());
      avisar();
    },
    apagar() {
      remover(CHAVES.chaveGemini);
      avisar();
    },
  };
}
