// Esqueleto de carregamento do diagnóstico (mostra o "formato" enquanto a IA pensa).

function Linha({ largura = 'w-full' }: { largura?: string }) {
  return <div className={`h-3.5 rounded-full bg-superficie-2 ${largura}`} />;
}

export function EsqueletoDiagnostico() {
  return (
    <div className="flex animate-pulse flex-col gap-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Gerando diagnóstico…</span>
      <div className="flex flex-col gap-2.5 rounded-2xl border border-borda bg-superficie p-5">
        <div className="mb-1 h-5 w-40 rounded-full bg-superficie-2" />
        <Linha />
        <Linha />
        <Linha largura="w-4/5" />
        <Linha largura="w-2/3" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-3 rounded-2xl border border-borda bg-superficie p-5">
            <div className="mb-1 h-5 w-32 rounded-full bg-superficie-2" />
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="flex gap-2">
                <div className="size-5 shrink-0 rounded-full bg-superficie-2" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Linha />
                  <Linha largura="w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
