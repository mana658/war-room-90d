// filepath: src/js/views/stages-secondary.js
(function initSecondaryStagesView(global) {
  'use strict';

  const WarRoom = (global.WarRoom = global.WarRoom || {});
  const { Security, Icons, Catalog, Store, Views } = WarRoom;
  const { escapeHTML, sanitizeUrl } = Security;

  function renderStage5() {
    const state = Store.getState();
    const p = state.promptGen;
    const generatedPrompt = Store.buildCleanCodePrompt();

    return `
      ${Views.renderStageHeader(
        5,
        'Gere prompts estruturados de arquitetura limpa com trava pedagógica de entrevista técnica para construir sistemas reais sem código artificial.'
      )}

      <div class="grid-sidebar-layout">
        <section class="card form-stack">
          <div>
            <h2 style="font-size: 1rem;">Parâmetros de Engenharia do Prompt</h2>
            <p class="text-muted" style="font-size: 0.76rem; margin-top: 0.2rem;">
              Configure o projeto e o módulo. O prompt ao lado exige código modular, validação Zod e inclui perguntas de defesa técnica.
            </p>
          </div>

          <div class="form-group">
            <label class="form-label" for="promptOfferSelect">1. Oferta / Projeto Base</label>
            <select
              id="promptOfferSelect"
              class="form-select"
              data-action="update-prompt-config"
              data-field="offerId"
            >
              <option value="1" ${Number(p.offerId) === 1 ? 'selected' : ''}>Oferta #1: Agente WhatsApp IA (Node + TS)</option>
              <option value="2" ${Number(p.offerId) === 2 ? 'selected' : ''}>Oferta #2: Landing Page Alta Conversão (Next.js 14)</option>
              <option value="3" ${Number(p.offerId) === 3 ? 'selected' : ''}>Oferta #3: Automação Backoffice &amp; PDF (Node/Python)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="promptModuleSelect">2. Camada Técnica a Construir Agora</label>
            <select
              id="promptModuleSelect"
              class="form-select"
              data-action="update-prompt-config"
              data-field="moduleType"
            >
              <option value="arch" ${p.moduleType === 'arch' ? 'selected' : ''}>1. Arquitetura Inicial, Tipagem &amp; Config (.env + Zod)</option>
              <option value="backend" ${p.moduleType === 'backend' ? 'selected' : ''}>2. Webhook Controller, Idempotência &amp; UseCase</option>
              <option value="llm" ${p.moduleType === 'llm' ? 'selected' : ''}>3. Integração OpenAI (Structured Outputs JSON)</option>
              <option value="frontend" ${p.moduleType === 'frontend' ? 'selected' : ''}>4. Interface Next.js / UI Responsiva 98+ PageSpeed</option>
              <option value="security" ${p.moduleType === 'security' ? 'selected' : ''}>5. Hardening: Rate Limiting, Erros &amp; Logs</option>
              <option value="refactor" ${p.moduleType === 'refactor' ? 'selected' : ''}>6. Code Review + Simulação de Entrevista Técnica</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="promptContextInput">3. Contexto Específico do Cliente / Regra de Negócio</label>
            <textarea
              id="promptContextInput"
              class="form-textarea"
              maxlength="1200"
              placeholder="Descreva o nicho do cliente, quais campos precisam ser validados e qual é o fluxo esperado..."
              data-action="update-prompt-context"
            >${escapeHTML(p.clientContext)}</textarea>
          </div>

          <div class="card card--status-info">
            <strong class="text-info" style="font-size: 0.78rem; display: block;">Regra de Ouro (Domínio Real)</strong>
            <p class="text-muted" style="font-size: 0.74rem; margin-top: 0.2rem;">
              Nunca faça commit de um arquivo gerado sem antes responder em voz alta às 2 perguntas técnicas que o prompt exige ao final da resposta.
            </p>
          </div>
        </section>

        <section class="card form-stack">
          <div class="code-panel">
            <div class="code-panel__header">
              <span class="code-panel__title">Prompt Estruturado (Pronto para Claude / ChatGPT / Gemini)</span>
              <button
                type="button"
                class="btn btn--primary btn--sm"
                data-action="copy-element-text"
                data-target="promptOutputPre"
              >
                ${Icons.render('copy', 'icon--sm')}
                <span>Copiar Prompt</span>
              </button>
            </div>
            <pre id="promptOutputPre" class="code-panel__pre" style="max-height: 30rem;">${escapeHTML(generatedPrompt)}</pre>
          </div>
        </section>
      </div>

      ${Views.renderStageFooter(5)}
    `;
  }

  function updatePromptOutputDOM() {
    const elPre = document.getElementById('promptOutputPre');
    if (elPre) {
      elPre.textContent = Store.buildCleanCodePrompt();
    }
  }

  function renderStage6() {
    const state = Store.getState();
    const b = state.blueprint;
    const offer = Catalog.OFFERS_CATALOG[b.offerId] || Catalog.OFFERS_CATALOG[1];
    const bpData = Store.getBlueprintData(b.offerId, b.readmeLang);

    return `
      ${Views.renderStageHeader(
        6,
        'Transforme cada entrega B2B em um repositório profissional no GitHub (sem dados sensíveis do cliente) para comprovar senioridade.'
      )}

      <section class="card utility-row">
        <div class="utility-actions">
          <span class="form-label" style="margin-right: 0.25rem;">Repositório Base:</span>
          ${Object.values(Catalog.OFFERS_CATALOG)
            .map(
              (o) => `
              <button
                type="button"
                class="btn ${Number(b.offerId) === o.id ? 'btn--primary' : 'btn--secondary'} btn--sm"
                data-action="set-blueprint-offer"
                data-offer-id="${o.id}"
              >
                <span>#${o.id} ${escapeHTML(o.shortName)}</span>
              </button>
            `
            )
            .join('')}
        </div>

        <div class="utility-actions">
          <span class="form-label">Idioma do README:</span>
          <button
            type="button"
            class="btn ${b.readmeLang === 'pt' ? 'btn--primary' : 'btn--secondary'} btn--sm"
            data-action="set-blueprint-lang"
            data-lang="pt"
          >
            <span>Português (BR)</span>
          </button>
          <button
            type="button"
            class="btn ${b.readmeLang === 'en' ? 'btn--primary' : 'btn--secondary'} btn--sm"
            data-action="set-blueprint-lang"
            data-lang="en"
          >
            <span>English (Global)</span>
          </button>
        </div>
      </section>

      <div class="grid-2col">
        <section class="card form-stack">
          <div class="code-panel">
            <div class="code-panel__header">
              <div>
                <span class="code-panel__title">Estrutura de Diretórios Recomendada</span>
                <p class="text-muted" style="font-size: 0.72rem; margin-top: 0.15rem;">
                  Repositório: <strong class="text-mono">${escapeHTML(offer.repoName)}</strong>
                </p>
              </div>
              <button
                type="button"
                class="btn btn--secondary btn--sm"
                data-action="copy-element-text"
                data-target="blueprintTreePre"
              >
                ${Icons.render('copy', 'icon--sm')}
                <span>Copiar Árvore</span>
              </button>
            </div>
            <pre id="blueprintTreePre" class="code-panel__pre">${escapeHTML(bpData.tree)}</pre>
          </div>

          <div class="card card--elevated">
            <strong style="font-size: 0.8rem; display: block;">Por que essa estrutura impressiona recrutadores?</strong>
            <p class="text-muted" style="font-size: 0.74rem; margin-top: 0.25rem;">
              Ela separa claramente contratos de validação (<span class="text-mono">schema.ts</span>), regras de negócio (<span class="text-mono">usecase.ts</span>) e integrações externas (<span class="text-mono">provider.ts</span>), provando que você não escreve código amador acoplado em um único arquivo.
            </p>
          </div>
        </section>

        <section class="card form-stack">
          <div class="code-panel">
            <div class="code-panel__header">
              <div>
                <span class="code-panel__title">Template README.md (${b.readmeLang === 'en' ? 'Inglês Internacional' : 'Português Executivo'})</span>
                <p class="text-muted" style="font-size: 0.72rem; margin-top: 0.15rem;">
                  Documentação focada em impacto de negócio e decisões técnicas
                </p>
              </div>
              <button
                type="button"
                class="btn btn--primary btn--sm"
                data-action="copy-element-text"
                data-target="blueprintReadmePre"
              >
                ${Icons.render('copy', 'icon--sm')}
                <span>Copiar README.md</span>
              </button>
            </div>
            <pre id="blueprintReadmePre" class="code-panel__pre">${escapeHTML(bpData.readme)}</pre>
          </div>
        </section>
      </div>

      ${Views.renderStageFooter(6)}
    `;
  }

  function renderStage7() {
    const state = Store.getState();
    const d = state.deliveryChecklist;
    const doneCount = d.steps.filter((s) => s.done).length;
    const totalCount = d.steps.length;
    const pct = Math.round((doneCount / totalCount) * 100);

    const stepsHtml = d.steps
      .map(
        (step, idx) => `
        <label class="checkbox-card ${step.done ? 'is-done' : ''}">
          <span class="checkbox-card__left">
            <input
              type="checkbox"
              class="checkbox-input"
              ${step.done ? 'checked' : ''}
              data-action="toggle-delivery-step"
              data-index="${idx}"
            />
            <span>
              <span class="badge ${step.done ? 'badge--success' : 'badge--info'}" style="margin-bottom: 0.25rem;">
                ${escapeHTML(step.phase)}
              </span>
              <span class="checkbox-card__title" style="display: block;">${escapeHTML(step.task)}</span>
            </span>
          </span>
        </label>
      `
      )
      .join('');

    return `
      ${Views.renderStageHeader(
        7,
        'Protocolo operacional padronizado para entregar projetos B2B em 72h a 5 dias, receber os 100% do Pix e alimentar o GitHub.'
      )}

      <section class="card form-stack">
        <div class="utility-row">
          <div style="flex: 1; min-width: 240px;">
            <label class="form-label" for="deliveryClientInput">Cliente / Projeto em Execução</label>
            <input
              id="deliveryClientInput"
              type="text"
              maxlength="90"
              value="${escapeHTML(d.clientName)}"
              class="form-input"
              style="margin-top: 0.25rem;"
              data-action="update-delivery-client"
            />
          </div>

          <div class="utility-actions" style="align-self: flex-end;">
            <span class="badge ${pct === 100 ? 'badge--success' : 'badge--info'}">
              Concluído: ${doneCount}/${totalCount} (${pct}%)
            </span>
            <button type="button" class="btn btn--secondary btn--sm" data-action="reset-delivery-checklist">
              <span>Reiniciar para Novo Cliente</span>
            </button>
          </div>
        </div>

        <div class="progress-track" role="progressbar" aria-label="Progresso da entrega" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}">
          <div class="progress-fill" style="width: ${pct}%;"></div>
        </div>

        <div class="form-stack" style="gap: 0.65rem;">
          ${stepsHtml}
        </div>
      </section>

      ${Views.renderStageFooter(7)}
    `;
  }

  function renderStage8(timerState) {
    const state = Store.getState();
    const e = state.english;
    const questions = Catalog.STANDUP_QUESTIONS;
    const qIndex = Math.max(0, Math.min(questions.length - 1, Number(e.currentQuestionIndex) || 0));
    const currentQ = questions[qIndex];

    const remainingSec = timerState?.remainingSeconds ?? e.timerDurationMinutes * 60;
    const isRunning = Boolean(timerState?.isRunning);
    const mins = String(Math.floor(remainingSec / 60)).padStart(2, '0');
    const secs = String(remainingSec % 60).padStart(2, '0');

    return `
      ${Views.renderStageHeader(
        8,
        'Treino ativo de fala técnica das 06:45 às 07:15. Responda em voz alta explicando o código que você construiu, sem traduzir mentalmente.'
      )}

      <div class="grid-sidebar-layout">
        <section class="card form-stack" style="align-items: center; text-align: center; justify-content: space-between;">
          <div style="width: 100%;">
            <div class="utility-row">
              <span class="badge badge--info">BLOCO 06:45 – 07:15</span>
              <span class="badge badge--success">Sessões Concluídas: ${e.completedSessions}</span>
            </div>

            <div id="standupTimerDisplay" class="standup-timer ${isRunning ? 'is-running' : ''}">
              ${mins}:${secs}
            </div>

            <div class="utility-actions" style="justify-content: center; margin-bottom: 1rem;">
              <button
                type="button"
                class="btn ${e.timerDurationMinutes === 15 ? 'btn--primary' : 'btn--secondary'} btn--sm"
                data-action="set-timer-duration"
                data-minutes="15"
              >
                <span>Sprint 15 min</span>
              </button>
              <button
                type="button"
                class="btn ${e.timerDurationMinutes === 30 ? 'btn--primary' : 'btn--secondary'} btn--sm"
                data-action="set-timer-duration"
                data-minutes="30"
              >
                <span>Bloco Completo 30 min</span>
              </button>
            </div>
          </div>

          <div class="utility-actions" style="justify-content: center; width: 100%;">
            <button
              type="button"
              id="standupToggleBtn"
              class="btn btn--primary"
              data-action="toggle-timer"
            >
              ${Icons.render(isRunning ? 'pause' : 'play', 'icon--sm')}
              <span>${isRunning ? 'Pausar Treino' : 'Iniciar Fala em Voz Alta'}</span>
            </button>

            <button
              type="button"
              class="btn btn--secondary"
              data-action="reset-timer"
            >
              <span>Reiniciar</span>
            </button>

            <button
              type="button"
              class="btn btn--secondary"
              data-action="complete-english-session"
              title="Registrar sessão de hoje como concluída"
            >
              ${Icons.render('check', 'icon--sm')}
              <span>+1 Sessão</span>
            </button>
          </div>

          <div class="card card--elevated" style="width: 100%; text-align: left;">
            <strong style="font-size: 0.78rem; display: block;">Protocolo de Destravamento de Fala:</strong>
            <p class="text-muted" style="font-size: 0.74rem; margin-top: 0.2rem;">
              1. Leia a pergunta ao lado em voz alta.<br />
              2. Fale por 2 minutos usando os blocos de estrutura (sem ler palavra por palavra).<br />
              3. Se travar em um termo, explique com palavras simples em inglês, mas não volte ao português.
            </p>
          </div>
        </section>

        <section class="card form-stack">
          <div class="utility-row">
            <span class="badge badge--info">Pergunta ${qIndex + 1} de${questions.length}</span>
            <div class="utility-actions">
              <button type="button" class="btn btn--secondary btn--sm" data-action="standup-prev-q">
                ${Icons.render('arrowLeft', 'icon--sm')}
                <span>Anterior</span>
              </button>
              <button type="button" class="btn btn--secondary btn--sm" data-action="standup-random-q">
                ${Icons.render('shuffle', 'icon--sm')}
                <span>Sortear</span>
              </button>
              <button type="button" class="btn btn--secondary btn--sm" data-action="standup-next-q">
                <span>Próxima</span>
                ${Icons.render('arrowRight', 'icon--sm')}
              </button>
            </div>
          </div>

          <div class="card card--elevated">
            <h2 style="font-size: 0.98rem; color: var(--brand-primary);">${escapeHTML(currentQ.q)}</h2>
          </div>

          <div class="code-panel">
            <span class="code-panel__title">Speaking Framework (Estrutura de Apoio Técnico)</span>
            <pre class="code-panel__pre">${escapeHTML(currentQ.framework)}</pre>
          </div>

          <div class="form-group">
            <label class="form-label" for="englishNotesInput">
              <span>Seus Tópicos-Chave do Dia (Bullet Points em Inglês)</span>
              <span class="text-muted">Auto-salvo</span>
            </label>
            <textarea
              id="englishNotesInput"
              class="form-textarea"
              maxlength="2000"
              placeholder="Write 3 quick bullet points about your current project before speaking..."
              data-action="update-english-notes"
            >${escapeHTML(e.practiceNotes)}</textarea>
          </div>
        </section>
      </div>

      ${Views.renderStageFooter(8)}
    `;
  }

  function renderStage9() {
    const state = Store.getState();
    const l = state.loan;

    const pendingCount = l.installments.filter((i) => i.status === 'pending').length;
    const paidNormalCount = l.installments.filter((i) => i.status === 'paid_normal').length;
    const amortizedCount = l.installments.filter((i) => i.status === 'amortized').length;

    const nominalInstallment = 134.0;
    const discountPct = Number(l.amortizationDiscountPercent) || 8;
    const amortizedUnitCost = nominalInstallment * (1 - discountPct / 100);

    const remainingNominalDebt = pendingCount * nominalInstallment;
    const remainingAmortizedPayoff = pendingCount * amortizedUnitCost;
    const potentialFutureSavings = remainingNominalDebt - remainingAmortizedPayoff;
    const alreadySavedByAmortization = amortizedCount * (nominalInstallment - amortizedUnitCost);

    const reserveGoal = 2000;
    const reservePct = Math.min(100, Math.round(((Number(l.emergencyReserve) || 0) / reserveGoal) * 100));

    const installmentsGridHtml = l.installments
      .map((inst, idx) => {
        const cardStatusClass =
          inst.status === 'amortized'
            ? 'card--status-positive'
            : inst.status === 'paid_normal'
            ? 'card--status-info'
            : '';

        const statusBadge =
          inst.status === 'amortized'
            ? '<span class="badge badge--success">Amortizada</span>'
            : inst.status === 'paid_normal'
            ? '<span class="badge badge--info">Paga no Venc.</span>'
            : '<span class="badge badge--warning">Pendente</span>';

        return `
          <div class="card card--elevated ${cardStatusClass} form-stack" style="gap: 0.6rem; padding: 1rem;">
            <div class="utility-row">
              <strong class="text-mono" style="font-size: 0.82rem;">Parcela #${String(inst.num).padStart(2, '0')}</strong>${statusBadge}
            </div>

            <div>
              <div class="text-muted" style="font-size: 0.72rem;">Vencimento: ${escapeHTML(inst.dueDate)}</div>
              <div class="text-mono" style="font-size: 1.1rem; font-weight: 800; margin-top: 0.15rem;">
                ${
                  inst.status === 'amortized'
                    ? `<span class="text-positive">${Store.formatBRL(amortizedUnitCost)}</span>`
                    : Store.formatBRL(inst.amount)
                }
              </div>
            </div>

            <div class="form-group">
              <label class="sr-only" for="instStatus_${idx}">Status da parcela ${inst.num}</label>
              <select
                id="instStatus_${idx}"
                class="form-select form-select--sm"
                data-action="update-installment-status"
                data-index="${idx}"
              >
                <option value="pending" ${inst.status === 'pending' ? 'selected' : ''}>Pendente (R$ 134,00)</option>
                <option value="paid_normal" ${inst.status === 'paid_normal' ? 'selected' : ''}>Paga no Vencimento</option>
                <option value="amortized" ${inst.status === 'amortized' ? 'selected' : ''}>Amortizada c/ Desconto</option>
              </select>
            </div>
          </div>
        `;
      })
      .join('');

    return `
      ${Views.renderStageHeader(
        9,
        'Estratégia em duas fases: primeiro blindar R$ 1.500 a R$ 2.000 de Reserva de Emergência, depois amortizar o empréstimo de trás para frente.'
      )}

      <section class="grid-kpi">
        <div class="card card--status-warning">
          <div class="kpi-card__head">
            <span>Saldo Nominal Restante (${pendingCount}/10)</span>${Icons.render('landmark', 'icon--sm')}
          </div>
          <div class="kpi-card__value text-warning">${Store.formatBRL(remainingNominalDebt)}</div>
          <div class="kpi-card__foot">
            <span>Pagas: ${paidNormalCount} • Amortizadas: ${amortizedCount}</span>
          </div>
        </div>

        <div class="card card--status-positive">
          <div class="kpi-card__head">
            <span>Quitação Antecipada (${discountPct}\% desc.)</span>${Icons.render('bolt', 'icon--sm')}
          </div>
          <div class="kpi-card__value text-positive">${Store.formatBRL(remainingAmortizedPayoff)}</div>
          <div class="kpi-card__foot">
            <span>Economia potencial: ${Store.formatBRL(potentialFutureSavings)}</span>
          </div>
        </div>

        <div class="card card--status-info">
          <div class="kpi-card__head">
            <span>Juros Já Economizados</span>
            ${Icons.render('check', 'icon--sm')}
          </div>
          <div class="kpi-card__value text-info">${Store.formatBRL(alreadySavedByAmortization)}</div>
          <div class="kpi-card__foot">
            <span>Valor c/ desconto: ${Store.formatBRL(amortizedUnitCost)}/parc.</span>
          </div>
        </div>

        <div class="card">
          <div class="kpi-card__head">
            <span>Reserva de Emergência Atual</span>
            ${Icons.render('shield', 'icon--sm')}
          </div>
          <div class="kpi-card__value">${Store.formatBRL(l.emergencyReserve)}</div>
          <div class="kpi-card__foot">
            <span>Meta de Segurança: ${Store.formatBRL(reserveGoal)} (${reservePct}%)</span>
          </div>
        </div>
      </section>

      <section class="card form-stack">
        <div class="grid-2col">
          <div class="form-group">
            <label class="form-label" for="loanReserveInput">
              <span>Saldo Atual na Reserva de Emergência (Caixinha Liquidez Diária R$)</span>
              <strong class="text-mono text-positive">${reservePct}% da Meta</strong>
            </label>
            <input
              id="loanReserveInput"
              type="number"
              step="50"
              min="0"
              value="${l.emergencyReserve}"
              class="form-input form-input--mono"
              data-action="update-loan-field"
              data-field="emergencyReserve"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="loanDiscountInput">
              <span>Desconto Médio de Antecipação no Banco (%)</span>
              <strong class="text-mono text-info">${discountPct}%</strong>
            </label>
            <input
              id="loanDiscountInput"
              type="number"
              step="0.5"
              min="0"
              max="50"
              value="${discountPct}"
              class="form-input form-input--mono"
              data-action="update-loan-field"
              data-field="amortizationDiscountPercent"
            />
          </div>
        </div>

        <div class="utility-row" style="padding-top: 0.5rem; border-top: 1px solid var(--border-subtle);">
          <div>
            <h2 style="font-size: 1rem;">Controle das 10 Parcelas de R$ 134,00 (Início: 20/Dez)</h2>
            <p class="text-muted" style="font-size: 0.75rem;">
              Quando fechar um projeto extra, antecipe sempre a última parcela (Parcela #10, #09...) para obter o maior desconto proporcional de juros.
            </p>
          </div>
        </div>

        <div class="grid-installments">
          ${installmentsGridHtml}
        </div>
      </section>

      ${Views.renderStageFooter(9)}
    `;
  }

  function renderStage10() {
    const state = Store.getState();
    const c = state.career;
    const doneCount = c.readinessChecks.filter((item) => item.done).length;
    const totalCount = c.readinessChecks.length;
    const pct = Math.round((doneCount / totalCount) * 100);

    const safeUrl1 = sanitizeUrl(c.githubProject1Url);
    const safeUrl2 = sanitizeUrl(c.githubProject2Url);

    const checksHtml = c.readinessChecks
      .map(
        (item, idx) => `
        <label class="checkbox-card ${item.done ? 'is-done' : ''}">
          <span class="checkbox-card__left">
            <input
              type="checkbox"
              class="checkbox-input"
              ${item.done ? 'checked' : ''}
              data-action="toggle-career-check"
              data-index="${idx}"
            />
            <span>
              <span class="badge badge--info" style="margin-bottom: 0.25rem;">${escapeHTML(item.category)}</span>
              <span class="checkbox-card__title" style="display: block;">${escapeHTML(item.label)}</span>
            </span>
          </span>
        </label>
      `
      )
      .join('');

    return `
      ${Views.renderStageHeader(
        10,
        'Construa a ponte do suporte técnico atual para Engenharia de Software na multinacional (às sextas-feiras) e prepare o salto para vagas remotas em dólar.'
      )}

      <div class="grid-sidebar-layout">
        <section class="card form-stack">
          <div>
            <div class="utility-row">
              <h2 style="font-size: 1rem;">Repositórios Oficiais de Portfólio (GitHub)</h2>
              <span class="badge badge--success">Prontidão: ${pct}%</span>
            </div>
            <p class="text-muted" style="font-size: 0.76rem; margin-top: 0.2rem;">
              Cole os links dos seus 2 repositórios principais estruturados na Etapa 6 para tê-los prontos para revisões técnicas e entrevistas.
            </p>
          </div>

          <div class="form-group">
            <label class="form-label" for="careerRepo1Input">
              <span>Repositório #01 (Agente WhatsApp IA / Backend TypeScript)</span>
              ${
                safeUrl1
                  ? `<a href="${escapeHTML(safeUrl1)}" target="_blank" rel="noopener noreferrer">Abrir Link &nearr;</a>`
                  : ''
              }
            </label>
            <input
              id="careerRepo1Input"
              type="url"
              placeholder="https://github.com/seu-usuario/ai-whatsapp-lead-dispatcher"
              value="${escapeHTML(c.githubProject1Url)}"
              class="form-input form-input--mono"
              data-action="update-career-url"
              data-field="githubProject1Url"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="careerRepo2Input">
              <span>Repositório #02 (Next.js Conversion Engine / ETL Documentos)</span>
              ${
                safeUrl2
                  ? `<a href="${escapeHTML(safeUrl2)}" target="_blank" rel="noopener noreferrer">Abrir Link &nearr;</a>`
                  : ''
              }
            </label>
            <input
              id="careerRepo2Input"
              type="url"
              placeholder="https://github.com/seu-usuario/nextjs-b2b-conversion-engine"
              value="${escapeHTML(c.githubProject2Url)}"
              class="form-input form-input--mono"
              data-action="update-career-url"
              data-field="githubProject2Url"
            />
          </div>

          <div class="card card--status-info form-stack" style="gap: 0.5rem;">
            <strong class="text-info" style="font-size: 0.82rem;">Roteiro Tático para as Sextas Presenciais na Multinacional</strong>
            <p class="text-muted" style="font-size: 0.75rem;">
              Você já tem o ativo mais difícil: o crachá da empresa e o contexto do produto. Na sexta-feira presencial, aproxime-se de um desenvolvedor ou Tech Lead e use esta abordagem natural:
            </p>
            <pre class="code-panel__pre" style="font-size: 0.74rem; padding: 0.75rem;">"Pessoal, estou finalizando Engenharia de Software e construí em produção um serviço em TypeScript/Node com validação Zod e integração de webhooks para clientes locais. Quando tiverem 10 minutos depois do almoço, poderiam dar uma olhada na arquitetura do meu repositório e me dizer o que eu deveria aprofundar para o padrão do time de engenharia daqui?"</pre>
          </div>
        </section>

        <section class="card form-stack">
          <div class="utility-row">
            <div>
              <h2 style="font-size: 1rem;">Matriz de Prontidão Técnica &amp; Carreira (${doneCount}/${totalCount})</h2>
              <p class="text-muted" style="font-size: 0.75rem;">Domine cada item para blindar suas entrevistas</p>
            </div>
            <span class="badge ${pct === 100 ? 'badge--success' : 'badge--info'}">${pct}% Pronto</span>
          </div>

          <div class="progress-track" role="progressbar" aria-label="Score de prontidão de carreira" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}">
            <div class="progress-fill" style="width: ${pct}%;"></div>
          </div>

          <div class="form-stack" style="gap: 0.65rem;">
            ${checksHtml}
          </div>
        </section>
      </div>

      ${Views.renderStageFooter(10)}
    `;
  }

  Object.assign(WarRoom.Views, {
    renderStage5,
    updatePromptOutputDOM,
    renderStage6,
    renderStage7,
    renderStage8,
    renderStage9,
    renderStage10
  });
})(window);