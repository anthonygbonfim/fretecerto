// Tema claro/escuro. A classe "dark" no <html> liga as cores escuras.
// O tema inicial é aplicado por um script no index.html (evita piscar).
// useSyncExternalStore mantém cabeçalho e Configurações sempre iguais.
import { useSyncExternalStore } from 'react';
import { CHAVES, gravar } from '../utils/armazenamento';

export type Tema = 'claro' | 'escuro';

const ouvintes = new Set<() => void>();

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

function lerTema(): Tema {
  return document.documentElement.classList.contains('dark') ? 'escuro' : 'claro';
}

function alternar() {
  const novo: Tema = lerTema() === 'escuro' ? 'claro' : 'escuro';
  document.documentElement.classList.toggle('dark', novo === 'escuro');
  gravar(CHAVES.tema, novo);
  ouvintes.forEach((f) => f());
}

export function useTema() {
  const tema = useSyncExternalStore(assinar, lerTema);
  return { tema, alternar };
}
