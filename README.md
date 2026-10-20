# 🚚 FreteCerto

**Planejador financeiro com IA para caminhoneiros autônomos.**

O FreteCerto ajuda o caminhoneiro a descobrir se o frete está pagando a estrada **e** sobrando para os sonhos. A pessoa informa a receita e os custos do mês, define uma meta (pneus novos, entrada da casa, reserva…) e recebe:

- **Indicadores calculados pelo app**: lucro operacional, sobra mensal, margem, receita/custo/lucro por km, peso do diesel na receita, quanto guardar por mês e o prazo realista da meta.
- **Status da meta**: *viável*, *precisa de ajuste* (falta até 20% por mês) ou *fora do prazo*.
- **Diagnóstico com IA** (Google Gemini): viabilidade, diagnóstico do mês, 4 dicas para gastar menos, 4 ideias para faturar mais (ex.: frete de retorno), 4 dicas de reserva e uma mensagem motivacional citando a meta.

> 🔗 **Demo:** https://anthonygbonfim.github.io/fretecerto/

---

## ✨ Funcionalidades

| | |
|---|---|
| 📝 **Formulário em 4 etapas** | Seus fretes → Custos da estrada → Custos fixos → Sua meta. Barra de progresso em forma de estrada, Voltar/Avançar, validação por etapa e botão **"Preencher com exemplo"**. |
| 💰 **Máscara de dinheiro brasileira** | Você digita só números e o campo mostra `1.234,56`. |
| 📊 **Resultado completo** | 9 indicadores, medidor da meta e uma barra mostrando para onde vai cada real do frete. |
| 🤖 **Diagnóstico com IA** | Gemini (`gemini-flash-latest`) com resposta em JSON. A IA **recebe os números prontos** e só comenta — ela nunca calcula. |
| 🧪 **Modo demonstração** | Sem chave, um diagnóstico gerado por regras locais no mesmo formato, com o aviso "modo demonstração". O site publicado funciona para qualquer pessoa. |
| 🔑 **Sua própria chave** | Colada em Configurações (campo de senha com Mostrar/Ocultar) e salva **só no navegador** (localStorage). Nunca fica no código nem no repositório. |
| 🕓 **Histórico** | Todas as simulações salvas no navegador, para abrir, ajustar ou excluir. |
| 🌗 **Tema claro e escuro** | O tema escolhido fica salvo. |
| 🛡️ **Robustez** | Skeleton durante o carregamento, mensagens claras para chave inválida, limite de uso, sem internet, demora e instabilidade, botão **"Tentar de novo"** e proteção contra chamadas duplicadas à API. |

---

## ▶️ Como executar

Pré-requisito: [Node.js](https://nodejs.org/) 20.19 ou mais novo.

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente http://localhost:5173).

Outros comandos:

```bash
npm run build    # gera a versão de produção na pasta dist/
npm run preview  # testa localmente a versão de produção
```

---

## 🔑 Como pegar a chave do Gemini (grátis)

1. Acesse o **[Google AI Studio](https://aistudio.google.com/apikey)** e entre com sua conta Google.
2. Clique em **Create API key** (Criar chave de API).
3. Copie a chave (ela começa com `AIza`).
4. No FreteCerto, vá em **Configurações**, cole a chave e clique em **Salvar**. Use **Testar chave** para conferir.

> 💸 **Para não ter custo:** use a chave no **plano gratuito** — não cadastre cartão nem ative o faturamento (billing) no projeto do Google Cloud. Se o limite gratuito acabar, o app apenas mostra o aviso "Limite de uso atingido".
> No plano gratuito, o Google pode usar os dados enviados para melhorar os serviços dele. Não coloque informações pessoais.
>
> 🔒 A chave fica salva apenas no seu navegador e vai direto para o Google. **Nunca** coloque a chave no código, em `.env` versionado ou no repositório.

---

## 🚀 Publicação no GitHub Pages (grátis)

O workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) faz o build e publica a cada push na `main`.

1. Crie um repositório **público** no GitHub e envie o projeto para a branch `main`.
2. No repositório, vá em **Settings → Pages** e, em **Source**, escolha **GitHub Actions**.
3. Faça um push: em alguns minutos o site estará em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

> Em repositório público, GitHub Actions e GitHub Pages são gratuitos. O `vite.config.ts` usa `base: './'` e as rotas usam hash (`#/`), então o site funciona em qualquer subpasta sem configuração extra.

---

## 🛠️ Tecnologias

- **React 19** + **TypeScript**
- **Vite** (build e servidor de desenvolvimento)
- **Tailwind CSS v4** com o plugin `@tailwindcss/vite`
- **Google Gemini API** (`gemini-flash-latest`, `responseMimeType: "application/json"` + `responseSchema`)
- **localStorage** para histórico, tema e chave
- **GitHub Actions** + **GitHub Pages**

Sem bibliotecas de UI, ícones ou rotas: os ícones são SVG feitos à mão e o roteamento é por hash (`#/simular`, `#/resultado/:id`, `#/historico`, `#/config`).

### Estrutura de pastas

```
src/
├── components/   # Peças visuais reutilizáveis (campos, botões, ícones, cartões…)
├── pages/        # Telas: Início, Simulador, Resultado, Histórico, Configurações
├── hooks/        # useRota, useTema, useChaveGemini, useDiagnostico
├── services/     # Gemini, diagnóstico local, histórico e erros
├── utils/        # Cálculos, formatação/máscaras, validação, armazenamento
├── data/         # Textos das etapas e dados de exemplo
└── types.ts      # Tipos compartilhados
```

### Como os números são calculados

| Indicador | Fórmula |
|---|---|
| Custos da estrada | diesel e Arla + pedágios + manutenção |
| Lucro operacional | receita − custos da estrada − custos fixos − parcelas |
| Sobra mensal | lucro operacional − retirada para a casa |
| Margem | lucro operacional ÷ receita |
| Receita / custo / lucro por km | valor ÷ km rodados |
| Peso do diesel | diesel e Arla ÷ receita |
| Guardar por mês | valor da meta ÷ prazo |
| Prazo realista | valor da meta ÷ sobra mensal (arredondado para cima) |
| Status | **viável** se sobra ≥ guardar por mês · **precisa de ajuste** se faltar até 20% · **fora do prazo** acima disso |

---

## 🆚 Melhorias em relação ao Planej.ai

- **Feito para a logística**: em vez de um orçamento genérico, fala a língua do caminhoneiro — fretes, km, diesel e Arla, pedágio, parcela do caminhão, retirada para casa.
- **Indicadores por km**: receita, custo e lucro por km rodado, além do peso do diesel na receita.
- **Números confiáveis**: todos os cálculos são feitos no código; a IA só interpreta e nunca inventa valores. O status da meta também é decidido pelo código, mesmo que a IA discorde.
- **Resposta estruturada**: a IA devolve JSON validado por esquema; se faltar alguma dica, o app completa com as regras locais.
- **Modo demonstração**: o site publicado funciona para qualquer pessoa, mesmo sem chave.
- **Chave segura**: cada pessoa usa a própria chave, salva só no navegador — nada de chave exposta no repositório.
- **Histórico de simulações**, com opção de reabrir e "Ajustar números".
- **Tratamento de erros completo**, skeleton de carregamento e proteção contra chamadas duplicadas.
- **Tema claro/escuro** e visual próprio, pensado para o celular.

---

## ✅ Como testar o fluxo principal

1. Rode `npm run dev` e abra o app.
2. Clique em **Começar simulação** e depois em **Preencher com exemplo**.
3. Avance pelas 4 etapas (tente avançar com um campo vazio para ver a validação).
4. Na página de resultado, confira os indicadores. Com o exemplo:
   - Entrada: fretes R$ 18.000,00 · 9.000 km · diesel R$ 7.500,00 · pedágios R$ 1.200,00 · manutenção R$ 1.500,00 · custos fixos R$ 1.300,00 · parcelas R$ 3.200,00 · retirada R$ 2.500,00 · meta "Jogo de pneus novos" de R$ 12.000,00 em 6 meses
   - Custos da estrada **R$ 10.200,00** · Lucro do caminhão (operacional) **R$ 3.300,00** · Sobra **R$ 800,00** · Margem **18,3%**
   - Receita/km **R$ 2,00** · Custo/km **R$ 1,63** · Lucro/km **R$ 0,37**
   - Guardar **R$ 2.000,00/mês** · Prazo realista **15 meses** · Status **Fora do prazo**
5. Sem chave, veja o diagnóstico com o aviso **Modo demonstração, sem IA** e o botão **Cadastrar chave**.
6. Vá em **Configurações**, cole sua chave do Gemini, clique em **Testar chave** e volte ao resultado para clicar em **Gerar com IA**. Depois de gerado, o diagnóstico fica salvo e não é pedido de novo ao recarregar.
7. Para testar erros: salve uma chave inválida (ex.: `AIza123`) ou desligue a internet, faça uma nova simulação e veja a mensagem com o botão **Tentar de novo**.
8. Abra o **Histórico**, reabra a simulação e exclua-a (dois cliques para confirmar).
9. Alterne o tema no ícone de sol/lua e recarregue a página: o tema continua.

---

## 📚 O que aprendi

- **Separar cálculo de interpretação**: deixar a matemática no código e usar a IA só para explicar deixa o resultado confiável e fácil de testar.
- **Pedir JSON para a IA** com `responseMimeType` e `responseSchema`, e mesmo assim validar e completar a resposta antes de mostrar.
- **Proteger chaves de API** em um site estático: sem backend, a solução é cada pessoa usar a própria chave, guardada só no navegador.
- **Tratar erros de rede de verdade**: diferenciar chave inválida, limite de uso, sem internet e tempo esgotado, sempre oferecendo um caminho ("Tentar de novo", "Ver demonstração").
- **Evitar chamadas duplicadas** com uma trava (`useRef`) e reaproveitando a mesma promessa em andamento — inclusive no `StrictMode` do React.
- **Tailwind CSS v4**: tema com variáveis CSS (`@theme inline`) para trocar entre claro e escuro sem repetir classes `dark:` em todo lugar.
- **Publicar SPA no GitHub Pages** com `base: './'`, rotas por hash e deploy automático com GitHub Actions.

---

*Orientação financeira educativa. Não substitui um contador.*
