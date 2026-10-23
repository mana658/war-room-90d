// filepath: src/js/core/catalog.js
(function initCatalogModule(global) {
  'use strict';

  const WarRoom = (global.WarRoom = global.WarRoom || {});

  const STAGES_META = [
    { id: 0, code: 'VISÃO GERAL', title: 'Command Center (Resumo)', icon: 'gauge', badge: 'Painel' },
    { id: 1, code: 'ETAPA 01', title: 'Saneamento & Fluxo (Dia 01/15)', icon: 'scale', badge: 'Finanças' },
    { id: 2, code: 'ETAPA 02', title: 'Cronograma de Guerra & Hábitos', icon: 'calendar', badge: 'Rotina' },
    { id: 3, code: 'ETAPA 03', title: 'Ofertas B2B & Calculadora Ticket', icon: 'target', badge: 'Produto' },
    { id: 4, code: 'ETAPA 04', title: 'Máquina Comercial & Scripts B2B', icon: 'briefcase', badge: 'Vendas' },
    { id: 5, code: 'ETAPA 05', title: 'Gerador de Prompts Clean Code', icon: 'terminal', badge: 'Velocidade' },
    { id: 6, code: 'ETAPA 06', title: 'Blueprint Arquitetura & GitHub', icon: 'gitBranch', badge: 'Portfólio' },
    { id: 7, code: 'ETAPA 07', title: 'Checklist Entrega Express (72h)', icon: 'rocket', badge: 'Execução' },
    { id: 8, code: 'ETAPA 08', title: 'Simulador Daily Standup (Inglês)', icon: 'mic', badge: 'Fala 06:45' },
    { id: 9, code: 'ETAPA 09', title: 'Quitação Empréstimo & Reserva', icon: 'landmark', badge: 'Dívida Zero' },
    { id: 10, code: 'ETAPA 10', title: 'Ponte Dev (Interna & Dólar)', icon: 'globe', badge: 'Carreira' }
  ];

  const OFFERS_CATALOG = {
    1: {
      id: 1,
      shortName: 'Agente WhatsApp IA & Triagem',
      title: 'Agente de Triagem, Qualificação e Agendamento no WhatsApp',
      stack: 'Node.js + TypeScript + Evolution API/Z-API + OpenAI (gpt-4o-mini Structured Outputs)',
      repoName: 'ai-whatsapp-lead-dispatcher',
      problem: 'Clínicas, imobiliárias e escritórios demoram mais de 2 horas para responder leads de anúncios fora do horário comercial e perdem vendas.',
      deliveryTime: '4 a 5 dias',
      defaultSetup: 1100,
      defaultMonthly: 200,
      highlights: [
        'Responde em 5 segundos 24/7 com contexto real do negócio',
        'Faz 3 perguntas objetivas de qualificação antes de acionar o humano',
        'Envia resumo estruturado do lead direto para o WhatsApp do vendedor fechar'
      ]
    },
    2: {
      id: 2,
      shortName: 'Landing Page + Webhook WhatsApp',
      title: 'Landing Page de Alta Velocidade (Next.js) + Alerta Instantâneo no WhatsApp',
      stack: 'Next.js 14 (App Router) + TypeScript + Tailwind CSS + Server Actions + Webhook WhatsApp',
      repoName: 'nextjs-b2b-conversion-engine',
      problem: 'Empresas de energia solar, móveis planejados e estética pagam tráfego caro para páginas lentas que perdem até 50% dos cliques.',
      deliveryTime: '72 horas',
      defaultSetup: 950,
      defaultMonthly: 100,
      highlights: [
        'Nota 98+ no Google PageSpeed (carregamento imediato em conexões 4G)',
        'Captura de lead com disparo em tempo real no WhatsApp do gestor comercial',
        'Hospedagem sem custo fixo na Vercel + SEO local otimizado para Joinville/SC'
      ]
    },
    3: {
      id: 3,
      shortName: 'Automação Backoffice & Leitura PDF',
      title: 'Automação de Backoffice e Extração de Documentos/PDFs com IA',
      stack: 'Node.js / Python + OpenAI Vision / Schema JSON + Google Sheets / API ERP (Bling/Omie)',
      repoName: 'llm-document-etl-service',
      problem: 'Transportadoras, contabilidades e imobiliárias gastam 2h/dia de funcionários digitando notas, comprovantes e PDFs manualmente em planilhas.',
      deliveryTime: '5 dias',
      defaultSetup: 1400,
      defaultMonthly: 250,
      highlights: [
        'Lê PDFs, fotos de comprovantes ou notas fiscais recebidas via WhatsApp ou E-mail',
        'Valida campos com Zod/Pydantic sem erro humano e alimenta planilha ou ERP',
        'Dispara relatório diário consolidado às 08:00 para o gestor'
      ]
    }
  };

  const SCHEDULE_BLOCKS = {
    seg_qui: [
      { time: '06:15 – 06:45', block: 'Despertar & Café', desc: 'Hidratação e ativação sem redes sociais.', tag: 'Energia' },
      { time: '06:45 – 07:15', block: 'Inglês Ativo (30 min)', desc: 'Responder em voz alta 2 perguntas de Daily Standup (Etapa 8). Proibido traduzir mentalmente.', tag: 'Inglês' },
      { time: '07:30 – 12:00', block: 'Trabalho CLT (Home Office)', desc: 'Entrega rápida e consistente no suporte para construir reputação interna.', tag: 'CLT' },
      { time: '12:00 – 13:00', block: '30m Almoço + 30m Máquina B2B', desc: 'Disparo de 15 abordagens comerciais via WhatsApp/Direct usando scripts da Etapa 4.', tag: 'Caixa Rápido' },
      { time: '13:00 – 17:18', block: 'Trabalho CLT (Home Office)', desc: 'Conclusão do turno oficial às 17:18 em ponto.', tag: 'CLT' },
      { time: '17:18 – 18:15', block: 'Transição, Família & Jantar', desc: 'Descompressão mental, atenção à esposa e rotina da casa.', tag: 'Família' },
      { time: '18:15 – 20:15', block: 'Sprint de Caixa Rápido (2h)', desc: 'Calls de 15 min com leads que responderam no almoço + código de entrega de clientes.', tag: 'Freela R$' },
      { time: '20:15 – 22:15', block: 'Engenharia Aplicada (2h)', desc: 'Estudo prático convertendo o aprendizado diretamente no repositório do GitHub.', tag: 'Portfólio' },
      { time: '22:15 – 23:30', block: 'Faculdade & Fechamento do Dia', desc: 'Avanço objetivo nas disciplinas acadêmicas + commits no GitHub.', tag: 'Acadêmico' },
      { time: '00:00 – 06:15', block: 'Sono Protegido (6h15m)', desc: 'Celular longe da cama. Recuperação cognitiva obrigatória.', tag: 'Inegociável' }
    ],
    sexta: [
      { time: '06:15 – 07:15', block: 'Preparação + Inglês no Deslocamento', desc: 'Treino de listening e shadowing técnico no trajeto presencial em Joinville.', tag: 'Inglês' },
      { time: '07:30 – 12:00', block: 'Trabalho CLT (Presencial)', desc: 'Postura profissional e visibilidade estratégica.', tag: 'CLT' },
      { time: '12:00 – 13:00', block: 'Almoço Estratégico (Networking)', desc: 'Almoçar próximo ao time de Desenvolvimento/TI. Sondar stack interna, dores e vagas.', tag: 'Carreira' },
      { time: '13:00 – 17:18', block: 'Trabalho CLT (Presencial)', desc: 'Fechamento da semana corporativa.', tag: 'CLT' },
      { time: '18:30 – 20:30', block: 'Fechamento Comercial da Semana', desc: 'Follow-up nos orçamentos abertos da semana para receber Pix de 50% antes do sábado.', tag: 'Caixa Rápido' },
      { time: '20:30 – 22:00', block: 'Faculdade (Provas e Entregas)', desc: 'Zerar pendências acadêmicas da semana para liberar o fim de semana.', tag: 'Acadêmico' },
      { time: '22:00 – 00:00', block: 'Noite Livre com a Esposa', desc: 'Desconexão e descanso em casal.', tag: 'Família' }
    ],
    sabado: [
      { time: '07:15 – 08:00', block: 'Café + Simulação Entrevista Inglês', desc: 'Explicar em inglês a arquitetura que será construída na manhã de sábado.', tag: 'Inglês' },
      { time: '08:00 – 12:30', block: 'Deep Work Engenharia (4h30)', desc: 'Bloco mais produtivo da semana: construir e publicar em produção os projetos vendidos e o Portfólio GitHub.', tag: 'Deep Code' },
      { time: '12:30 – 14:00', block: 'Almoço em Família', desc: 'Presença total em casa.', tag: 'Família' },
      { time: '14:00 – 17:30', block: 'Preparação da Máquina Comercial', desc: 'Mapear 60 empresas no Radar/Google Maps (Joinville e SC) para abordar de segunda a quinta.', tag: 'Comercial' },
      { time: '17:30 em diante', block: 'Sábado à Noite + Domingo 100% Livre', desc: 'Regra de ouro: Domingo é 100% dedicado para família, descanso e recarga.', tag: 'Inegociável' }
    ]
  };

  const RADAR_RINGS = [
    {
      index: 0,
      label: 'Anel 1 (Raio 4 km): Joinville Zona Norte (Costa e Silva, América, Bom Retiro)',
      shortLabel: 'Zona Norte de Joinville (Raio 4 km)',
      city: 'Joinville',
      regionQuery: 'Zona Norte, Costa e Silva, América, Santo Antônio, Joinville - SC',
      lat: -26.2625,
      lon: -48.8510,
      radiusMeters: 4000
    },
    {
      index: 1,
      label: 'Anel 2 (Raio 12 km): Joinville Completa (Centro, Atiradores, Sul)',
      shortLabel: 'Joinville Completa (Raio 12 km)',
      city: 'Joinville',
      regionQuery: 'Centro, Atiradores, Anita Garibaldi, Joinville - SC',
      lat: -26.3044,
      lon: -48.8464,
      radiusMeters: 12000
    },
    {
      index: 2,
      label: 'Anel 3 (Raio 45 km): Jaraguá do Sul, Araquari & São Bento do Sul',
      shortLabel: 'Norte de SC - Jaraguá do Sul & Região (Raio 45 km)',
      city: 'Jaraguá do Sul / Região',
      regionQuery: 'Jaraguá do Sul, Guaramirim, São Bento do Sul - SC',
      lat: -26.4851,
      lon: -49.0713,
      radiusMeters: 25000
    },
    {
      index: 3,
      label: 'Anel 4 (Raio 110 km): Blumenau, Itajaí, Balneário Camboriú & Curitiba',
      shortLabel: 'Vale do Itajaí, Litoral & Curitiba (Raio 110 km)',
      city: 'Blumenau / Balneário / Curitiba',
      regionQuery: 'Blumenau, Balneário Camboriú, Itajaí - SC',
      lat: -26.9194,
      lon: -49.0661,
      radiusMeters: 30000
    }
  ];

  const RADAR_NICHES = {
    dentist: {
      key: 'dentist',
      label: 'Clínicas Odontológicas & Médicas',
      offerId: 1,
      osmFilter: '"amenity"~"dentist|clinic|doctors"',
      searchKeyword: 'Clínica Odontológica Implantes'
    },
    beauty: {
      key: 'beauty',
      label: 'Estética, Dermatologia & Beleza',
      offerId: 1,
      osmFilter: '"shop"~"beauty|cosmetics|hairdresser"',
      searchKeyword: 'Clínica de Estética Avançada'
    },
    realestate: {
      key: 'realestate',
      label: 'Imobiliárias & Corretores',
      offerId: 1,
      osmFilter: '"office"~"estate_agent|property_management"',
      searchKeyword: 'Imobiliária Venda e Aluguel'
    },
    lawyer: {
      key: 'lawyer',
      label: 'Advocacia & Contabilidade',
      offerId: 3,
      osmFilter: '"office"~"lawyer|accountant|tax_advisor"',
      searchKeyword: 'Escritório de Advocacia e Contabilidade'
    },
    solar: {
      key: 'solar',
      label: 'Energia Solar & Móveis Planejados',
      offerId: 2,
      osmFilter: '"shop"~"furniture|interior_decoration|electronics"',
      searchKeyword: 'Energia Solar Móveis Planejados'
    }
  };

  const STANDUP_QUESTIONS = [
    {
      q: '1. Daily Standup Core: "What did you build yesterday, what are you building today, and do you have any blockers?"',
      framework:
        '• "Yesterday, I worked on the [module name, e.g., WhatsApp webhook validation] using [TypeScript and Zod]."\n' +
        '• "Today, my main focus is implementing the [OpenAI structured output service] to qualify leads automatically."\n' +
        '• "Right now, I don\'t have any major blockers, just testing edge cases in the API response."'
    },
    {
      q: '2. Architecture Defense: "How do you make sure your webhook doesn\'t process the same WhatsApp message twice?"',
      framework:
        '• "To prevent duplicate processing, I implement idempotency using the unique message ID from the provider."\n' +
        '• "Before calling the LLM, I check if that message ID was already processed in my cache or database."\n' +
        '• "This saves OpenAI tokens and prevents sending double replies to the customer."'
    },
    {
      q: '3. React / Next.js Interview: "Why did you use Next.js Server Actions and Server Components in this Landing Page?"',
      framework:
        '• "I chose Server Components to ship minimal JavaScript to the browser, which gives us a 98+ PageSpeed score on mobile."\n' +
        '• "For the lead form, I used Server Actions with Zod validation so the API keys and webhook URLs stay 100% secure on the server."'
    },
    {
      q: '4. Error Handling: "What happens in your system if the OpenAI API times out or returns an error?"',
      framework:
        '• "I wrap external API calls in a try/catch block with an explicit timeout and retry policy."\n' +
        '• "If the LLM fails after retries, the system falls back gracefully by sending a polite standard message and alerting the human agent immediately."'
    },
    {
      q: '5. Career Pitch: "Tell me about yourself and your experience as a developer."',
      framework:
        '• "I currently work in technical support at a multinational company while completing my Software Engineering degree."\n' +
        '• "In parallel, I build production Full-Stack and AI automation systems in TypeScript, Node.js, and Next.js for real B2B clients."\n' +
        '• "I focus on solving real business bottlenecks with clean, maintainable architecture."'
    }
  ];

  function createDefaultState() {
    return {
      currentStage: 0,
      completedStages: {
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
        7: false,
        8: false,
        9: false,
        10: false
      },
      finances: {
        incomeDay15: 1117.32,
        incomeDay01: 814.68,
        incomeVA: 660.00,
        extraFreelaManual: 0,
        syncFreelaWithCRM: true,
        expenses: [
          { id: 'aluguel', name: 'Aluguel (Zona Norte Joinville)', current: 1673.00, warTarget: 1673.00, cycle: 'Dia 01', useWarTarget: false, fixed: true },
          { id: 'condominio', name: 'Condomínio', current: 500.00, warTarget: 500.00, cycle: 'Dia 01', useWarTarget: false, fixed: true },
          { id: 'mercado', name: 'Mercado Extra (Além do VA R$ 660)', current: 600.00, warTarget: 400.00, cycle: 'Mensal', useWarTarget: true, fixed: false },
          { id: 'gasolina', name: 'Gasolina (4 dias Home Office)', current: 400.00, warTarget: 280.00, cycle: 'Mensal', useWarTarget: true, fixed: false },
          { id: 'luz', name: 'Energia Elétrica', current: 180.00, warTarget: 180.00, cycle: 'Dia 15', useWarTarget: false, fixed: true },
          { id: 'internet', name: 'Internet Fibra (Trabalho/Estudo)', current: 120.00, warTarget: 120.00, cycle: 'Dia 15', useWarTarget: false, fixed: true },
          { id: 'emprestimo', name: 'Empréstimo (10x R$ 134 - Início 20/Dez)', current: 134.00, warTarget: 134.00, cycle: 'Dia 15', useWarTarget: false, fixed: true }
        ]
      },
      schedule: {
        activeTab: 'seg_qui',
        streakDays: 1,
        dailyHabits: [
          { id: 'h1', time: '06:45 – 07:15', label: 'Inglês Ativo (30m): Responder Daily Scrum em voz alta sem traduzir', done: false },
          { id: 'h2', time: '12:30 – 13:00', label: 'Bloco Comercial Almoço: Disparar 15 abordagens B2B (Joinville/Região)', done: false },
          { id: 'h3', time: '18:15 – 20:15', label: 'Caixa Rápido (2h): Calls de fechamento 15m + Entrega de Freelas', done: false },
          { id: 'h4', time: '20:15 – 22:15', label: 'Engenharia Aplicada (2h): Código direto no Projeto GitHub/Cliente', done: false },
          { id: 'h5', time: '22:15 – 23:30', label: 'Faculdade (1h15): Avançar disciplinas garantindo aprovação limpa', done: false },
          { id: 'h6', time: '00:00 – 06:15', label: 'Sono Protegido Inegociável (6h15m de recuperação)', done: false }
        ]
      },
      offers: {
        selectedOfferId: 1,
        calcSetupPrice: 1100,
        calcMonthlyFee: 200,
        calcTargetIncome: 2000
      },
      sales: {
        activeSubTab: 'crm',
        scriptOfferId: 1,
        scriptNiche: 'Clínica Odontológica / Estética',
        scriptCompanyName: 'Clínica Sorriso Joinville',
        scriptContactName: 'Dr. Marcos',
        scriptCity: 'Joinville',
        radar: {
          nicheKey: 'dentist',
          ringIndex: 0,
          results: [],
          seenKeys: [],
          lastSearchInfo: '',
          isLoading: false
        },
        leads: [
          { id: 'l1', company: 'OdontoPrime Norte', niche: 'Clínica Odontológica', offerId: 1, setupValue: 1100, status: 'Reunião', notes: 'Demorou 3h para responder no WhatsApp' },
          { id: 'l2', company: 'SolarSul Energia', niche: 'Energia Solar', offerId: 2, setupValue: 950, status: 'Prospecção', notes: 'Usando Linktree lento nos anúncios' },
          { id: 'l3', company: 'Imobiliária Costa Verde', niche: 'Imobiliária', offerId: 1, setupValue: 1200, status: 'Respondeu', notes: 'Pediu exemplo de triagem automática' }
        ]
      },
      promptGen: {
        offerId: 1,
        moduleType: 'arch',
        clientContext: 'Clínica odontológica em Joinville que recebe 40 leads/dia de implante e ortodontia. Precisa qualificar urgência, bairro e horário preferido antes de notificar a recepcionista.'
      },
      blueprint: {
        offerId: 1,
        readmeLang: 'pt'
      },
      deliveryChecklist: {
        clientName: 'Projeto Cliente #01',
        steps: [
          { id: 'd1', phase: 'Dia 1 (Fechamento)', task: 'Receber 50% do Setup via Pix antes de escrever a primeira linha de código', done: false },
          { id: 'd2', phase: 'Dia 1 (Setup)', task: 'Coletar variáveis de ambiente, chaves de API e regras de negócio em 1 página', done: false },
          { id: 'd3', phase: 'Dia 2 (Core)', task: 'Construir arquitetura modular tipada (TypeScript) usando o Gerador da Etapa 5', done: false },
          { id: 'd4', phase: 'Dia 3 (Integração)', task: 'Conectar Webhook / WhatsApp / OpenAI com validação Zod e tratamento de erros', done: false },
          { id: 'd5', phase: 'Dia 4 (Deploy)', task: 'Subir em produção (Vercel / Railway / Render) e testar fluxo ponta a ponta no celular', done: false },
          { id: 'd6', phase: 'Dia 5 (Handoff)', task: 'Gravar vídeo de 3 min mostrando funcionando + Receber 50% Pix final', done: false },
          { id: 'd7', phase: 'Dia 5 (Portfólio)', task: 'Remover dados sensíveis do cliente e subir versão limpa no GitHub com README da Etapa 6', done: false }
        ]
      },
      english: {
        timerDurationMinutes: 15,
        currentQuestionIndex: 0,
        practiceNotes: 'Yesterday I implemented the webhook validation layer using TypeScript and Zod. Today I am focusing on the OpenAI structured output integration.',
        completedSessions: 3
      },
      loan: {
        emergencyReserve: 0,
        amortizationDiscountPercent: 8,
        installments: [
          { num: 1, dueDate: '20/Dez', amount: 134.00, status: 'pending' },
          { num: 2, dueDate: '20/Jan', amount: 134.00, status: 'pending' },
          { num: 3, dueDate: '20/Fev', amount: 134.00, status: 'pending' },
          { num: 4, dueDate: '20/Mar', amount: 134.00, status: 'pending' },
          { num: 5, dueDate: '20/Abr', amount: 134.00, status: 'pending' },
          { num: 6, dueDate: '20/Mai', amount: 134.00, status: 'pending' },
          { num: 7, dueDate: '20/Jun', amount: 134.00, status: 'pending' },
          { num: 8, dueDate: '20/Jul', amount: 134.00, status: 'pending' },
          { num: 9, dueDate: '20/Ago', amount: 134.00, status: 'pending' },
          { num: 10, dueDate: '20/Set', amount: 134.00, status: 'pending' }
        ]
      },
      career: {
        githubProject1Url: '',
        githubProject2Url: '',
        readinessChecks: [
          { id: 'c1', category: 'Portfólio Real', label: 'Projeto #1 em produção e documentado em inglês/português no GitHub', done: false },
          { id: 'c2', category: 'Portfólio Real', label: 'Projeto #2 em produção resolvendo dor real B2B no GitHub', done: false },
          { id: 'c3', category: 'Domínio Técnico', label: 'Explicar Event Loop, Async/Await, Promises e Concorrência em Node.js sem IA', done: false },
          { id: 'c4', category: 'Domínio Técnico', label: 'Explicar Server Components vs Client Components e ciclo de vida no React/Next.js', done: false },
          { id: 'c5', category: 'Domínio Técnico', label: 'Explicar Arquitetura em Camadas, Webhooks, Idempotência e validação com Zod', done: false },
          { id: 'c6', category: 'Ponte Interna (Sexta)', label: 'Mapear quem é o Tech Lead / Gestor de Engenharia de Software na multinacional atual', done: false },
          { id: 'c7', category: 'Ponte Interna (Sexta)', label: 'Tomar 1 café no dia presencial com dev do time interno e pedir feedback de arquitetura do Projeto #1', done: false },
          { id: 'c8', category: 'Carreira Internacional', label: 'LinkedIn 100% bilíngue (PT/EN) focado em Full-Stack TypeScript & AI Automation', done: false }
        ]
      }
    };
  }

  WarRoom.Catalog = {
    STAGES_META,
    OFFERS_CATALOG,
    SCHEDULE_BLOCKS,
    RADAR_RINGS,
    RADAR_NICHES,
    STANDUP_QUESTIONS,
    createDefaultState
  };
})(window);