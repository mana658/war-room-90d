// filepath: src/js/core/store.js
(function initStoreModule(global) {
  'use strict';

  const WarRoom = (global.WarRoom = global.WarRoom || {});
  const { Security, Catalog } = WarRoom;

  const STORAGE_KEY = 'WAR_ROOM_90D_STATE_V3';
  const LEGACY_KEYS = ['WAR_ROOM_90D_STATE_V2', 'WAR_ROOM_90D_STATE_V1'];
  const THEME_KEY = 'WAR_ROOM_90D_THEME';
  const SERPER_SESSION_KEY = 'WAR_ROOM_SERPER_API_KEY';

  const NORTH_JOINVILLE_COORDS = { lat: -26.2625, lon: -48.8510 };
  const BACKTICK = String.fromCharCode(96);
  const CODE_FENCE = BACKTICK + BACKTICK + BACKTICK;

  let state = loadInitialState();

  function loadInitialState() {
    const defaultState = Catalog.createDefaultState();
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        for (const legacyKey of LEGACY_KEYS) {
          const candidate = localStorage.getItem(legacyKey);
          if (candidate) {
            raw = candidate;
            break;
          }
        }
      }
      if (!raw) return defaultState;

      const parsed = JSON.parse(raw);
      const validation = Security.validateAndSanitizeBackup(parsed, defaultState);
      return validation.isValid && validation.sanitizedState ? validation.sanitizedState : defaultState;
    } catch {
      return defaultState;
    }
  }

  function saveState() {
    try {
      const serializable = structuredClone ? structuredClone(state) : JSON.parse(JSON.stringify(state));
      if (serializable.sales && serializable.sales.radar) {
        delete serializable.sales.radar.serperApiKey;
        serializable.sales.radar.isLoading = false;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    } catch {
      // Silencia erro de cota de storage
    }
  }

  function getState() {
    return state;
  }

  function resetToDefault() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
    } catch {
      // Ignora erro em modo privado
    }
    state = Catalog.createDefaultState();
    saveState();
    return state;
  }

  function importFromRawJSON(rawString) {
    try {
      const parsed = JSON.parse(rawString);
      const defaultState = Catalog.createDefaultState();
      const validation = Security.validateAndSanitizeBackup(parsed, defaultState);
      if (!validation.isValid || !validation.sanitizedState) {
        return { ok: false, error: validation.error || 'Estrutura JSON inválida.' };
      }
      state = validation.sanitizedState;
      saveState();
      return { ok: true, error: null };
    } catch {
      return { ok: false, error: 'Sintaxe JSON malformada. Verifique o conteúdo enviado.' };
    }
  }

  function exportCleanBackupJSON() {
    const copy = structuredClone ? structuredClone(state) : JSON.parse(JSON.stringify(state));
    if (copy.sales && copy.sales.radar) {
      delete copy.sales.radar.serperApiKey;
      copy.sales.radar.isLoading = false;
    }
    return JSON.stringify(copy, null, 2);
  }

  function loadTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Ignora erro
    }
    return next;
  }

  function formatBRL(value) {
    const num = Number(value) || 0;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function calculateCRMClosedIncome() {
    return state.sales.leads.reduce((acc, lead) => {
      const val = Number(lead.setupValue) || 0;
      if (lead.status === 'Fechado 50% Pix') return acc + val * 0.5;
      if (lead.status === 'Entregue 100%') return acc + val;
      return acc;
    }, 0);
  }

  function calculateFinancialSummary() {
    const f = state.finances;
    const crmFreela = calculateCRMClosedIncome();
    const manualFreela = Number(f.extraFreelaManual) || 0;
    const activeFreela = f.syncFreelaWithCRM ? crmFreela + manualFreela : manualFreela;

    const cltCash = (Number(f.incomeDay15) || 0) + (Number(f.incomeDay01) || 0);
    const baseFixedIncome = cltCash + (Number(f.incomeVA) || 0);
    const totalIncome = baseFixedIncome + activeFreela;

    let totalBaselineExpenses = 0;
    let totalActiveExpenses = 0;
    let day15Expenses = 0;
    let rentAmount = 1673;

    f.expenses.forEach((exp) => {
      const base = Number(exp.current) || 0;
      const war = Number(exp.warTarget) || 0;
      const activeVal = exp.useWarTarget ? war : base;

      totalBaselineExpenses += base;
      totalActiveExpenses += activeVal;

      if (exp.cycle === 'Dia 15') {
        day15Expenses += activeVal;
      }
      if (exp.id === 'aluguel') {
        rentAmount = activeVal;
      }
    });

    const savingsFromCuts = totalBaselineExpenses - totalActiveExpenses;
    const originalDeficitWithoutFreela = baseFixedIncome - totalBaselineExpenses;
    const deficitWithActiveCutsWithoutFreela = baseFixedIncome - totalActiveExpenses;
    const freelaNeededToBreakEven = Math.max(0, totalActiveExpenses - baseFixedIncome);
    const netBalance = totalIncome - totalActiveExpenses;
    const day15LeftoverForRentVault = (Number(f.incomeDay15) || 0) - day15Expenses;
    const targetFreelaGoal = Number(state.offers.calcTargetIncome) || 2000;
    const projectedBalanceWithGoal = baseFixedIncome + targetFreelaGoal - totalActiveExpenses;

    return {
      cltCash,
      baseFixedIncome,
      crmFreela,
      activeFreela,
      totalIncome,
      totalBaselineExpenses,
      totalActiveExpenses,
      savingsFromCuts,
      originalDeficitWithoutFreela,
      deficitWithActiveCutsWithoutFreela,
      freelaNeededToBreakEven,
      netBalance,
      day15Expenses,
      day15LeftoverForRentVault,
      rentAmount,
      targetFreelaGoal,
      projectedBalanceWithGoal
    };
  }

  function getDynamicOfferPrice(offerId) {
    const id = Number(offerId) || 1;
    if (id === Number(state.offers.selectedOfferId)) {
      return Number(state.offers.calcSetupPrice) || Catalog.OFFERS_CATALOG[id].defaultSetup;
    }
    return Catalog.OFFERS_CATALOG[id] ? Catalog.OFFERS_CATALOG[id].defaultSetup : 1100;
  }

  function generateB2BScripts() {
    const s = state.sales;
    const offerId = Number(s.scriptOfferId) || 1;
    const company = s.scriptCompanyName.trim() || 'sua empresa';
    const contact = s.scriptContactName.trim() || 'tudo bem';
    const niche = s.scriptNiche.trim() || 'empresas da região';
    const city = s.scriptCity.trim() || 'Joinville';

    const setupPrice = getDynamicOfferPrice(offerId);
    const halfPix = setupPrice * 0.5;
    const monthlyFee =
      offerId === Number(state.offers.selectedOfferId)
        ? Number(state.offers.calcMonthlyFee) || 0
        : Catalog.OFFERS_CATALOG[offerId]?.defaultMonthly || 200;

    const monthlyClause = monthlyFee > 0 ? `, com manutenção opcional de ${formatBRL(monthlyFee)}/mês` : '';

    if (offerId === 1) {
      return {
        initial:
          `Olá, ${contact}! Tudo bem? Falo aqui de ${city}.\n\n` +
          `Estava pesquisando algumas referências de ${niche} aqui em ${city} e cheguei até a ${company}.\n\n` +
          `Notei que vocês recebem bastante demanda pelo WhatsApp e Instagram. Hoje eu desenvolvo uma estrutura de Triagem e Qualificação Instantânea com IA direto no WhatsApp que atende o lead em 5 segundos (inclusive após as 18h e no horário de almoço), faz as perguntas de filtro e entrega o resumo pronto para o seu comercial apenas fechar.\n\n` +
          `Posso te mandar um vídeo curto de 40 segundos aqui mesmo mostrando como funciona na prática, sem compromisso?`,
        followup:
          `Oi, ${contact}! Imagino a correria aí na ${company}.\n\n` +
          `Deixei separado um ambiente de demonstração do Agente de Triagem simulando o atendimento de um cliente da ${company} fora do horário comercial.\n\n` +
          `Se fizer sentido parar de perder leads que chamam à noite ou no fim de semana, você tem 15 minutos hoje após as 18:15 para eu compartilhar a tela e te mostrar rodando?`,
        closingCall:
          `ROTEIRO DE CALL DE 15 MINUTOS (FECHAMENTO):\n` +
          `1. Diagnóstico Rápido (3 min): "Hoje, quando um cliente chama a ${company} às 19h30 ou no domingo, quanto tempo demora até alguém responder?"\n` +
          `2. Demonstração da Solução (5 min): Compartilhe a tela mostrando o fluxo da Oferta #1 (IA responde em 5s -> coleta Nome, Interesse e Urgência -> dispara resumo para o vendedor).\n` +
          `3. Ancoragem Financeira (3 min): "Se esse sistema salvar apenas 1 ou 2 clientes por mês que desistiriam pela demora, ele já se paga no primeiro mês."\n` +
          `4. Proposta & Pix 50% (4 min): "Eu entrego tudo configurado e rodando em 5 dias por ${formatBRL(setupPrice)} (sendo ${formatBRL(halfPix)} agora via Pix para reserva da sprint e ${formatBRL(halfPix)} somente após você testar e aprovar${monthlyClause}). Podemos iniciar hoje?"`
      };
    }

    if (offerId === 2) {
      return {
        initial:
          `Olá, ${contact}! Tudo bem? Falo aqui de ${city}.\n\n` +
          `Vi o perfil da ${company} (${niche}) e notei que o link principal de atendimento de vocês passa por uma página que leva alguns segundos no 4G para carregar o contato.\n\n` +
          `Sou desenvolvedor de software aqui em ${city} e construo Landing Pages de Alta Velocidade (Next.js com nota 98+ no Google) que abrem instantaneamente no celular e disparam um alerta automático no seu WhatsApp assim que o cliente solicita orçamento.\n\n` +
          `Topa que eu te envie um protótipo visual da ${company} aqui no WhatsApp para você comparar a velocidade?`,
        followup:
          `Olá, ${contact}! Passando rápido porque deixei pronta a estrutura de demonstração da nova página rápida da ${company}.\n\n` +
          `Ela ficou com carregamento instantâneo no mobile e já integrada ao gatilho direto para o WhatsApp da sua equipe.\n\n` +
          `Consegue avaliar em uma chamada rápida de 10 minutos hoje após as 18:15?`,
        closingCall:
          `ROTEIRO DE CALL DE 15 MINUTOS (FECHAMENTO):\n` +
          `1. Dor de Tráfego (3 min): Mostre que a cada 3 segundos de lentidão no celular, até 40% dos cliques de anúncios fecham a aba antes de chamar no WhatsApp.\n` +
          `2. Demonstração Ao Vivo (5 min): Abra o protótipo Next.js na tela, preencha o formulário de orçamento rápido e mostre a mensagem chegando instantaneamente no WhatsApp.\n` +
          `3. Fechamento Express 72h (5 min): "Entrego publicada no domínio da ${company} em 72 horas, sem mensalidade de construtor lento, por ${formatBRL(setupPrice)} (${formatBRL(halfPix)} no ato via Pix e ${formatBRL(halfPix)} na entrega aprovada${monthlyClause}). Vamos colocar no ar esta semana?"`
      };
    }

    return {
      initial:
        `Olá, ${contact}! Tudo bem? Sou desenvolvedor de automações aqui em ${city}.\n\n` +
        `Tenho conversado com gestores de ${niche} e vejo muita equipe perdendo 1 a 2 horas por dia digitando dados de PDFs, comprovantes, notas ou planilhas manualmente de um sistema para outro.\n\n` +
        `Na ${company}, qual é hoje a rotina repetitiva de planilha ou documento que mais consome tempo operacional da equipe?\n\n` +
        `Desenvolvo automações sob medida que leem esses arquivos em segundos e alimentam o sistema sem erro humano.`,
      followup:
        `Oi, ${contact}! Tudo certo?\n\n` +
        `Caso vocês tenham algum fluxo manual de leitura de PDFs, lançamento em ERP ou geração de relatórios diários aí na ${company}, consigo automatizar esse processo em até 5 dias para liberar horas da sua equipe.\n\n` +
        `Podemos fazer uma call rápida de 15 min hoje às 18:30 para eu mapear como eliminar essa digitação manual?`,
      closingCall:
        `ROTEIRO DE CALL DE 15 MINUTOS (FECHAMENTO):\n` +
        `1. Cálculo de Custo Oculto (4 min): "Quantas horas por semana sua equipe gasta copiando e conferindo esses dados? Em 1 ano são mais de 250 horas pagas para digitação manual."\n` +
        `2. Demonstração Técnica (5 min): Mostre o serviço lendo um PDF/imagem e preenchendo a planilha/sistema em 3 segundos sem erro humano + enviando alerta no WhatsApp.\n` +
        `3. Fechamento (5 min): "Desenvolvo essa automação exclusiva para a ${company} em 5 dias por ${formatBRL(setupPrice)} (${formatBRL(halfPix)} no início via Pix e ${formatBRL(halfPix)} na entrega validada${monthlyClause}). Começamos hoje?"`
    };
  }

  function buildCleanCodePrompt() {
    const p = state.promptGen;
    const offer = Catalog.OFFERS_CATALOG[p.offerId] || Catalog.OFFERS_CATALOG[1];

    const moduleNames = {
      arch: 'Arquitetura Inicial, Tipagem Estrita e Configuração de Ambiente',
      backend: 'Camada de Webhook, Controle de Concorrência e Regras de Negócio',
      llm: 'Integração com OpenAI / LLM via Structured Outputs (JSON Schema Garantido)',
      frontend: 'Interface / Landing Page em Next.js + Tailwind com Nota 98+ PageSpeed',
      security: 'Tratamento de Erros, Rate Limiting, Validação Zod e Logs de Produção',
      refactor: 'Revisão Clean Code e Simulação de Entrevista Técnica'
    };

    return (
      `# ROLE: TECH LEAD SÊNIOR FULL-STACK & MENTOR DE ARQUITETURA\n` +
      `Estou construindo em produção um projeto real B2B: **${offer.title}**.\n` +
      `Stack Oficial: **${offer.stack}**.\n` +
      `Repositório de Portfólio: ${BACKTICK}${offer.repoName}${BACKTICK}.\n\n` +
      `## ESCOPO DO MÓDULO ATUAL\n` +
      `Quero desenvolver agora o módulo: **${moduleNames[p.moduleType] || moduleNames.arch}**.\n\n` +
      `## CONTEXTO E REGRAS DE NEGÓCIO DO CLIENTE\n` +
      `${p.clientContext}\n\n` +
      `## REGRAS INEGOCIÁVEIS DE ENGENHARIA (PADRÃO ANTI-CLICHÊ DE IA)\n` +
      `1. **Zero Código com Cara de IA:** Proibido inserir comentários óbvios de tutorial. Comente apenas decisões arquiteturais críticas ("por que" e não "o que").\n` +
      `2. **Clean Code & Modularidade:** Use nomes semânticos em inglês, funções pequenas com responsabilidade única (SRP), separação clara entre Controller/Handler, UseCase/Service e Provider/Adapter.\n` +
      `3. **Tipagem Estrita & Validação:** Use TypeScript estrito (proibido usar ${BACKTICK}any${BACKTICK}). Valide todos os payloads de entrada e variáveis de ambiente usando ${BACKTICK}Zod${BACKTICK}.\n` +
      `4. **Resiliência de Produção:** Implemente tratamento de erros estruturado, timeouts explícitos em chamadas externas e logs limpos.\n\n` +
      `## MÉTODO DIDÁTICO OBRIGATÓRIO (ENTREVISTA DE DEV)\n` +
      `Após entregar o código pronto para produção:\n` +
      `1. Explique de forma direta o **raciocínio arquitetural** por trás das escolhas feitas neste módulo;\n` +
      `2. Faça **2 perguntas técnicas de entrevista** sobre este código para validar se sei sustentar e explicar cada decisão para um Tech Lead sem depender de IA.`
    );
  }

  function getBlueprintData(offerId, lang) {
    const id = Number(offerId) || 1;
    const offer = Catalog.OFFERS_CATALOG[id] || Catalog.OFFERS_CATALOG[1];

    const trees = {
      1:
        `ai-whatsapp-lead-dispatcher/\n` +
        `├── src/\n` +
        `│   ├── config/\n` +
        `│   │   └── env.ts                  # Validação estrita de variáveis com Zod\n` +
        `│   ├── modules/\n` +
        `│   │   ├── webhook/\n` +
        `│   │   │   ├── whatsapp.controller.ts  # Recebe eventos da Evolution/Z-API\n` +
        `│   │   │   └── webhook.schema.ts       # Contratos de entrada tipados\n` +
        `│   │   ├── triage/\n` +
        `│   │   │   ├── qualify-lead.usecase.ts # Orquestra estado da conversa e regras\n` +
        `│   │   │   └── lead-session.repository.ts\n` +
        `│   │   └── ai/\n` +
        `│   │       ├── openai.provider.ts      # Chamada estruturada (JSON Schema)\n` +
        `│   │       └── prompts.ts              # System prompt isolado e parametrizável\n` +
        `│   └── shared/\n` +
        `│       ├── errors/app-error.ts\n` +
        `│       └── http/server.ts\n` +
        `├── docker-compose.yml\n` +
        `├── package.json\n` +
        `└── README.md`,
      2:
        `nextjs-b2b-conversion-engine/\n` +
        `├── src/\n` +
        `│   ├── app/\n` +
        `│   │   ├── layout.tsx              # Font optimization & Dynamic SEO Metadata\n` +
        `│   │   ├── page.tsx                # Server Component (98+ PageSpeed Score)\n` +
        `│   │   └── actions/\n` +
        `│   │       └── submit-lead.ts      # Next.js Server Action + Rate Limit\n` +
        `│   ├── components/\n` +
        `│   │   ├── sections/               # Hero, Proof, Calculator, FAQ\n` +
        `│   │   └── ui/                     # Componentes acessíveis e reutilizáveis\n` +
        `│   └── lib/\n` +
        `│       ├── validation/lead.schema.ts # Validação client + server com Zod\n` +
        `│       └── integrations/whatsapp-webhook.ts # Disparo com retry policy\n` +
        `├── tailwind.config.ts\n` +
        `└── README.md`,
      3:
        `llm-document-etl-service/\n` +
        `├── src/\n` +
        `│   ├── config/env.ts\n` +
        `│   ├── pipelines/\n` +
        `│   │   ├── ingest-document.service.ts   # Recebe PDF/Imagem via Webhook/Folder\n` +
        `│   │   ├── vision-extractor.provider.ts # Extração estruturada via LLM Vision\n` +
        `│   │   └── erp-sync.adapter.ts          # Envia JSON validado para Planilha/ERP\n` +
        `│   ├── schemas/\n` +
        `│   │   └── invoice.schema.ts            # Garante 0 alucinação nos campos numéricos\n` +
        `│   └── jobs/\n` +
        `│       └── daily-summary.cron.ts        # Relatório matinal às 08:00 no WhatsApp\n` +
        `└── README.md`
    };

    const readmePT =
      `# ${offer.repoName}\n\n` +
      `> Arquitetura de produção para **${offer.title}**, focada em baixa latência, tipagem estrita e alta confiabilidade B2B.\n\n` +
      `## Problema de Negócio Resolvido\n` +
      `${offer.problem}\n\n` +
      `## Decisões Arquiteturais (Clean Architecture & Pragmatismo)\n` +
      `- **Validação na Borda (Fail-Fast):** Todos os payloads de entrada e variáveis de ambiente são validados com ${BACKTICK}Zod${BACKTICK} antes de tocar na camada de domínio.\n` +
      `- **Desacoplamento de Providers:** A integração com LLM/WhatsApp utiliza contratos claros, permitindo substituir o provedor sem alterar a regra de negócio.\n` +
      `- **Prevenção de Alucinação:** Uso de *Structured Outputs* garantindo resposta estritamente aderente ao schema JSON.\n\n` +
      `## Stack Tecnológica\n` +
      `- ${offer.stack}\n\n` +
      `## Como Executar Localmente\n` +
      `${CODE_FENCE}bash\n` +
      `git clone https://github.com/seu-usuario/${offer.repoName}.git\n` +
      `cd ${offer.repoName}\n` +
      `cp .env.example .env\n` +
      `npm install\n` +
      `npm run dev\n` +
      `${CODE_FENCE}`;

    const readmeEN =
      `# ${offer.repoName}\n\n` +
      `> Production-grade architecture for **B2B Automation & High-Conversion Lead Dispatching**, engineered with strict TypeScript, modular layers, and deterministic LLM outputs.\n\n` +
      `## Business Problem & Impact\n` +
      `Small and medium B2B enterprises lose up to 45% of inbound leads due to slow response times and manual backoffice bottlenecks. This service automates qualification and dispatching in under 5 seconds.\n\n` +
      `## Key Engineering Decisions\n` +
      `- **Strict Boundary Validation:** Every webhook payload and environment variable is validated at runtime using ${BACKTICK}Zod${BACKTICK} schemas.\n` +
      `- **Provider Abstraction:** External APIs (OpenAI, WhatsApp Gateways, ERPs) are isolated behind clean adapters for easy testing and mocking.\n` +
      `- **Deterministic AI Outputs:** Enforces JSON Schema structured responses to prevent parsing failures in production.\n\n` +
      `## Tech Stack\n` +
      `- ${offer.stack}\n\n` +
      `## Quick Start\n` +
      `${CODE_FENCE}bash\n` +
      `git clone https://github.com/your-username/${offer.repoName}.git\n` +
      `cd ${offer.repoName}\n` +
      `cp .env.example .env\n` +
      `npm install\n` +
      `npm run dev\n` +
      `${CODE_FENCE}`;

    return {
      tree: trees[id] || trees[1],
      readme: lang === 'en' ? readmeEN : readmePT
    };
  }

  function calcDistanceKmFromNorthJoinville(lat2, lon2) {
    const latNum = Number(lat2);
    const lonNum = Number(lon2);
    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) return null;

    const R = 6371;
    const dLat = ((latNum - NORTH_JOINVILLE_COORDS.lat) * Math.PI) / 180;
    const dLon = ((lonNum - NORTH_JOINVILLE_COORDS.lon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((NORTH_JOINVILLE_COORDS.lat * Math.PI) / 180) *
        Math.cos((latNum * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  }

  function isBuyerAlreadySeenOrInCRM(companyName) {
    const key = Security.normalizeEntityKey(companyName);
    if (!key) return true;

    const inCRM = state.sales.leads.some((lead) => Security.normalizeEntityKey(lead.company) === key);
    if (inCRM) return true;

    return state.sales.radar.seenKeys.includes(key);
  }

  function getSerperApiKey() {
    return Security.getSessionSecret(SERPER_SESSION_KEY);
  }

  function setSerperApiKey(value) {
    Security.setSessionSecret(SERPER_SESSION_KEY, value);
  }

  WarRoom.Store = {
    getState,
    saveState,
    resetToDefault,
    importFromRawJSON,
    exportCleanBackupJSON,
    loadTheme,
    toggleTheme,
    formatBRL,
    calculateCRMClosedIncome,
    calculateFinancialSummary,
    getDynamicOfferPrice,
    generateB2BScripts,
    buildCleanCodePrompt,
    getBlueprintData,
    calcDistanceKmFromNorthJoinville,
    isBuyerAlreadySeenOrInCRM,
    getSerperApiKey,
    setSerperApiKey
  };
})(window);