// Rotas por hash (#/caminho): funcionam no GitHub Pages sem configurar servidor.
import { useEffect, useState } from 'react';

function lerRota(): string {
  const hash = window.location.hash.replace(/^#/, '');
  return hash.startsWith('/') ? hash : '/';
}

export function useRota(): string {
  const [rota, setRota] = useState(lerRota);

  useEffect(() => {
    const aoMudar = () => {
      setRota(lerRota());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', aoMudar);
    return () => window.removeEventListener('hashchange', aoMudar);
  }, []);

  return rota;
}

export function navegar(caminho: string): void {
  window.location.hash = caminho;
}
