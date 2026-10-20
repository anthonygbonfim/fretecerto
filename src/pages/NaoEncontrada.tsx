// Página para rotas ou simulações que não existem.
import { Botao } from '../components/Botao';

export function NaoEncontrada({ texto = 'Essa página não existe. Parece que pegamos a saída errada.' }: { texto?: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <div className="h-3 w-40 rounded zebrado" />
      <h1 className="text-5xl font-extrabold">Rota bloqueada</h1>
      <p className="text-suave">{texto}</p>
      <Botao href="#/">Voltar ao início</Botao>
    </div>
  );
}
