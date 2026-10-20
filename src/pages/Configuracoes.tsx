// Configurações: chave do Gemini (só no navegador), tema e limpeza de dados.
import { useState, type FormEvent } from 'react';
import { Botao } from '../components/Botao';
import {
  IconeAlerta,
  IconeCadeado,
  IconeCheck,
  IconeChave,
  IconeLinkExterno,
  IconeLixeira,
  IconeLua,
  IconeOlho,
  IconeOlhoFechado,
  IconeSol,
} from '../components/Icones';
import { useChaveGemini } from '../hooks/useChaveGemini';
import { useTema } from '../hooks/useTema';
import { ErroDiagnostico } from '../services/erros';
import { testarChave } from '../services/gemini';
import { limparHistorico } from '../services/historico';

type Aviso = { tipo: 'ok' | 'erro' | 'info'; texto: string } | null;

/** Mostra só o começo e o fim da chave: "AIza…x9Qk" */
function mascararChave(chave: string): string {
  return chave.length > 10 ? `${chave.slice(0, 4)}…${chave.slice(-4)}` : '••••';
}

export function Configuracoes() {
  const { chave, temChave, salvar, apagar } = useChaveGemini();
  const { tema, alternar } = useTema();
  const [rascunho, setRascunho] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [testando, setTestando] = useState(false);
  const [aviso, setAviso] = useState<Aviso>(null);
  const [confirmarLimpeza, setConfirmarLimpeza] = useState(false);

  function aoSalvar(ev: FormEvent) {
    ev.preventDefault();
    const nova = rascunho.trim();
    if (!nova) {
      setAviso({ tipo: 'erro', texto: 'Cole a chave antes de salvar.' });
      return;
    }
    salvar(nova);
    setRascunho('');
    setMostrar(false);
    setAviso(
      /^AIza[\w-]{30,}$/.test(nova)
        ? { tipo: 'ok', texto: 'Chave salva neste navegador.' }
        : { tipo: 'info', texto: 'Chave salva neste navegador, mas ela não parece uma chave do Gemini (que começa com "AIza"). Use "Testar chave" para conferir.' },
    );
  }

  async function aoTestar() {
    if (testando || !temChave) return; // evita testes duplicados
    setTestando(true);
    setAviso(null);
    try {
      await testarChave(chave);
      setAviso({ tipo: 'ok', texto: 'Tudo certo! O Google aceitou sua chave.' });
    } catch (erro) {
      const msg = erro instanceof ErroDiagnostico ? `${erro.titulo}. ${erro.message}` : 'Não foi possível testar agora.';
      setAviso({ tipo: 'erro', texto: msg });
    } finally {
      setTestando(false);
    }
  }

  function aoApagar() {
    apagar();
    setAviso({ tipo: 'ok', texto: 'Chave removida deste navegador. O app voltou para o modo demonstração.' });
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-4xl font-extrabold">Configurações</h1>

      {/* Chave do Gemini */}
      <section className="flex flex-col gap-5 rounded-3xl border border-borda bg-superficie p-5 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <IconeChave className="text-sinal" /> Chave do Gemini
            </h2>
            <p className="mt-1 text-sm text-suave">Liga o diagnóstico com inteligência artificial.</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              temChave ? 'bg-ok/15 text-ok' : 'bg-sinal/15 text-sinal-forte dark:text-sinal'
            }`}
          >
            {temChave ? 'IA ativa' : 'Modo demonstração'}
          </span>
        </div>

        {/* Chave salva aparece sempre mascarada */}
        {temChave && (
          <div className="flex items-center gap-3 rounded-xl bg-superficie-2 px-4 py-3 text-sm">
            <span className="text-suave">Chave salva:</span>
            <span className="font-mono">{mascararChave(chave)}</span>
          </div>
        )}

        <form onSubmit={aoSalvar} className="flex flex-col gap-3">
          <label htmlFor="chave" className="text-sm font-semibold">
            {temChave ? 'Trocar a chave' : 'Cole sua chave aqui'}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            {/* Campo do tipo senha (••••) com botão Mostrar/Ocultar ao lado */}
            <div className="flex min-h-11 min-w-0 flex-1 items-center rounded-xl border-2 border-borda bg-superficie focus-within:border-sinal">
              <input
                id="chave"
                type={mostrar ? 'text' : 'password'}
                autoComplete="off"
                spellCheck={false}
                placeholder="AIza..."
                value={rascunho}
                onChange={(e) => setRascunho(e.target.value)}
                className="w-full min-w-0 bg-transparent px-3.5 py-2.5 font-mono text-sm outline-none [&:focus-visible]:outline-none"
              />
              <button
                type="button"
                onClick={() => setMostrar((m) => !m)}
                className="mr-1 flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-suave hover:bg-superficie-2 hover:text-texto"
                aria-controls="chave"
                aria-pressed={mostrar}
              >
                {mostrar ? <IconeOlhoFechado tamanho={16} /> : <IconeOlho tamanho={16} />}
                {mostrar ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <Botao type="submit">Salvar</Botao>
          </div>
        </form>

        {aviso && (
          <p
            role="status"
            className={`flex gap-2 rounded-xl px-4 py-3 text-sm ${
              aviso.tipo === 'ok' ? 'bg-ok/10 text-ok' : aviso.tipo === 'erro' ? 'bg-perigo/10 text-perigo' : 'bg-superficie-2'
            }`}
          >
            {aviso.tipo === 'ok' ? <IconeCheck tamanho={18} className="shrink-0" /> : <IconeAlerta tamanho={18} className="shrink-0" />}
            {aviso.texto}
          </p>
        )}

        {temChave && (
          <div className="flex flex-wrap gap-2">
            <Botao variante="secundario" onClick={aoTestar} disabled={testando}>
              {testando ? 'Testando…' : 'Testar chave'}
            </Botao>
            <Botao variante="perigo" onClick={aoApagar}>
              <IconeLixeira tamanho={16} /> Remover chave
            </Botao>
          </div>
        )}

        <div className="flex gap-3 rounded-xl border border-borda p-4 text-sm">
          <IconeCadeado className="mt-0.5 shrink-0 text-ok" />
          <p className="text-suave">
            Sua chave fica salva <strong className="text-texto">só neste navegador</strong> e vai direto daqui para o
            Google. Ela não é enviada para nenhum outro lugar e não fica no código do site. Em computador
            compartilhado, remova a chave quando terminar.
          </p>
        </div>
      </section>

      {/* Passo a passo da chave */}
      <section className="flex flex-col gap-4 rounded-3xl border border-borda bg-superficie p-5 sm:p-7">
        <h2 className="text-2xl font-bold">Como pegar sua chave grátis</h2>
        <ol className="flex flex-col gap-3 text-sm">
          {[
            <>
              Entre no{' '}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold underline decoration-sinal decoration-2 underline-offset-2"
              >
                Google AI Studio <IconeLinkExterno tamanho={14} />
              </a>{' '}
              com sua conta Google.
            </>,
            <>Clique em <strong>"Create API key"</strong> (Criar chave de API).</>,
            <>Copie a chave gerada (começa com <code className="rounded bg-superficie-2 px-1">AIza</code>).</>,
            <>Volte aqui, cole no campo acima e clique em <strong>Salvar</strong>.</>,
          ].map((passo, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sinal text-xs font-bold text-asfalto">
                {i + 1}
              </span>
              <span className="pt-0.5">{passo}</span>
            </li>
          ))}
        </ol>
        <p className="rounded-xl bg-superficie-2 p-4 text-sm text-suave">
          <strong className="text-texto">Sem custo:</strong> use a chave no plano gratuito, sem cadastrar cartão nem
          ativar faturamento no projeto do Google. Se o limite gratuito acabar, o app só avisa e você tenta mais tarde.
          No plano gratuito, o Google pode usar os dados enviados para melhorar os serviços dele. Não coloque
          informações pessoais.
        </p>
      </section>

      {/* Aparência e dados */}
      <section className="flex flex-col gap-4 rounded-3xl border border-borda bg-superficie p-5 sm:p-7">
        <h2 className="text-2xl font-bold">Aparência e dados</h2>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold">Tema</p>
            <p className="text-sm text-suave">{tema === 'escuro' ? 'Asfalto (escuro)' : 'Dia claro'}</p>
          </div>
          <Botao variante="secundario" onClick={alternar}>
            {tema === 'escuro' ? <IconeSol tamanho={18} /> : <IconeLua tamanho={18} />}
            {tema === 'escuro' ? 'Usar tema claro' : 'Usar tema escuro'}
          </Botao>
        </div>
        <div className="h-px bg-borda" />
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold">Histórico de simulações</p>
            <p className="text-sm text-suave">Apaga todas as simulações salvas neste navegador.</p>
          </div>
          <Botao
            variante="perigo"
            onBlur={() => setConfirmarLimpeza(false)}
            onClick={() => {
              if (!confirmarLimpeza) return setConfirmarLimpeza(true);
              limparHistorico();
              setConfirmarLimpeza(false);
              setAviso({ tipo: 'info', texto: 'Histórico apagado.' });
            }}
          >
            <IconeLixeira tamanho={16} /> {confirmarLimpeza ? 'Confirmar' : 'Apagar'}
          </Botao>
        </div>
      </section>
    </div>
  );
}
