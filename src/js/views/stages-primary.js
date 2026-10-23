// filepath: src/js/views/stages-primary.js
(function initPrimaryStagesView(global) {
  'use strict';

  const WarRoom = (global.WarRoom = global.WarRoom || {});
  const { Security, Icons, Catalog, Store } = WarRoom;
  const { escapeHTML, sanitizeUrl } = Security;

  function renderStageHeader(stageId, subtitle) {
    const state = Store.getState();
    const stage = Catalog.STAGES_META.find((s) => s.id === stageId);
    if (!stage) return '';

    const isDone = Boolean(state.completedStages[stageId]);

    return `
      <section class="card stage-header">
        <div>
          <div class="stage-header__top">
            <span class="badge badge--info">${escapeHTML(stage.code)}</span>
            <span class="badge">${escapeHTML(stage.badge)}</span>
            ${isDone ? `<span class="badge badge--success">${Icons.render('check', 'icon--sm')} Concluída</span>` : ''}
          </div>
          <h1 class="stage-header__title">${escapeHTML(stage.title)}</h1>
          <p class="stage-header__subtitle">${escapeHTML(subtitle)}</p>
        </div>

        <div class="stage-header__actions">
          <button
            type="button"
            class="btn btn--secondary btn--sm"
            data-action="select-stage"
            data-stage="0"
          >
            ${Icons.render('gauge', 'icon--sm')}
            <span>Painel Geral</span>
          </button>

          <button
            type="button"
            class="btn ${isDone ? 'btn--primary' : 'btn--secondary'} btn--sm"
            data-action="toggle-stage-done"
            data-stage="${stageId}"
            aria-pressed="${isDone ? 'true' : 'false'}"
          >
            ${Icons.render('check', 'icon--sm')}
            <span>${isDone ? 'Etapa Concluída' : 'Marcar como Concluída'}</span>
          </button>
        </div>
      </section>
    `;
  }

  function renderStageFooter(stageId) {
    const prevStage = Catalog.STAGES_META.find((s) => s.id === stageId - 1);
    const nextStage = Catalog.STAGES_META.find((s) => s.id === stageId + 1);

    return `
      <nav class="card utility-row" aria-label="Navegação entre etapas">
        <div>
          ${
            prevStage
              ? `<button type="button" class="btn btn--secondary btn--sm" data-action="select-stage" data-stage="${prevStage.id}">
                  ${Icons.render('arrowLeft', 'icon--sm')}
                  <span>Anterior: ${escapeHTML(prevStage.code)}</span>
                </button>`
              : `<button type="button" class="btn btn--secondary btn--sm" data-action="select-stage" data-stage="0">
                  ${Icons.render('gauge', 'icon--sm')}
                  <span>Voltar à Visão Geral</span>
                </button>`
          }
        </div>
        <div>
          ${
            nextStage
              ? `<button type="button" class="btn btn--primary btn--sm" data-action="select-stage" data-stage="${nextStage.id}">
                  <span>Próxima: ${escapeHTML(nextStage.code)} — ${escapeHTML(nextStage.title)}</span>${Icons.render('arrowRight', 'icon--sm')}
                </button>`
              : `<button type="button" class="btn btn--primary btn--sm" data-action="select-stage" data-stage="0">
                  ${Icons.render('check', 'icon--sm')}
                  <span>Finalizar no Command Center</span>
                </button>`
          }
        </div>
      </nav>
    `;
  }

  function renderStage0() {
    const state = Store.getState();
    const fin = Store.calculateFinancialSummary();
    const selectedOffer = Catalog.OFFERS_CATALOG[state.offers.selectedOfferId] || Catalog.OFFERS_CATALOG[1];

    const habitsDone = state.schedule.dailyHabits.filter((h) => h.done).length;
    const habitsTotal = state.schedule.dailyHabits.length;

    const careerDone = state.career.readinessChecks.filter((c) => c.done).length;
    const careerTotal = state.career.readinessChecks.length;

    const paidInstallments = state.loan.installments.filter((i) => i.status !== 'pending').length;

    const totalNeed = Math.max(1, fin.totalActiveExpenses - fin.baseFixedIncome + fin.targetFreelaGoal);
    const currentProgressVal = Math.max(0, fin.activeFreela + fin.savingsFromCuts);
    const thermoPct = Math.min(100, Math.round((currentProgressVal / totalNeed) * 100));

    const stageCardsHtml = Catalog.STAGES_META.filter((s) => s.id > 0)
      .map((s) => {
        const isDone = Boolean(state.completedStages[s.id]);
        return `
          <div class="card ${isDone ? 'card--status-positive' : ''}">
            <div class="utility-row">
              <span class="badge ${isDone ? 'badge--success' : 'badge--info'}">${escapeHTML(s.code)}</span>
              <button
                type="button"
                class="btn btn--ghost btn--sm"
                data-action="toggle-stage-done"
                data-stage="${s.id}"
                aria-label="Alternar conclusão da ${escapeHTML(s.title)}"
              >
                ${Icons.render('check', 'icon--sm')}
                <span>${isDone ? 'Concluída' : 'Pendente'}</span>
              </button>
            </div>
            <h3 style="font-size: 0.95rem; margin: 0.65rem 0 0.35rem 0;">${escapeHTML(s.title)}</h3>
            <div class="utility-row" style="margin-top: 0.75rem;">
              <span class="badge">${escapeHTML(s.badge)}</span>
              <button
                type="button"
                class="btn btn--secondary btn--sm"
                data-action="select-stage"
                data-stage="${s.id}"
              >
                <span>Abrir Etapa</span>
                ${Icons.render('arrowRight', 'icon--sm')}
              </button>
            </div>
          </div>
        `;
      })
      .join('');

    return `
      <section class="card">
        <div class="utility-row">
          <div>
            <div class="stage-header__top">
              <span class="badge badge--success">PLANO INTEGRADO 90 DIAS</span>
              <span class="badge badge--info">Joinville • Norte SC</span>
              <span class="badge">Suporte CLT para Engenharia Full-Stack &amp; IA</span>
            </div>
            <h1 class="stage-header__title">Command Center — Painel Executivo de Decisão</h1>
            <p class="stage-header__subtitle">
              Acompanhamento em tempo real de fluxo de caixa quinzenal, funil comercial B2B, engenharia de portfólio e transição de carreira.
            </p>
          </div>
          <div class="utility-actions">
            <button type="button" class="btn btn--primary btn--sm" data-action="select-stage" data-stage="4">
              ${Icons.render('briefcase', 'icon--sm')}
              <span>Ir para Máquina B2B</span>
            </button>
            <button type="button" class="btn btn--secondary btn--sm" data-action="select-stage" data-stage="2">
              ${Icons.render('calendar', 'icon--sm')}
              <span>Hábitos (${habitsDone}/${habitsTotal})</span>
            </button>
          </div>
        </div>
      </section>

      <section class="grid-kpi" aria-label="Indicadores estratégicos">
        <button
          type="button"
          class="card card--interactive ${fin.netBalance >= 0 ? 'card--status-positive' : 'card--status-negative'}"
          data-action="select-stage"
          data-stage="1"
        >
          <div class="kpi-card__head">
            <span>1. Balanço Líquido Mensal</span>
            ${Icons.render('scale', 'icon--sm')}
          </div>
          <div class="kpi-card__value ${fin.netBalance >= 0 ? 'text-positive' : 'text-negative'}">
            ${Store.formatBRL(fin.netBalance)}
          </div>
          <div class="kpi-card__foot">
            <span>Cortes de guerra: +${Store.formatBRL(fin.savingsFromCuts)}</span>
            <span>Etapa 01 &rarr;</span>
          </div>
        </button>

        <button
          type="button"
          class="card card--interactive card--status-info"
          data-action="select-stage"
          data-stage="4"
        >
          <div class="kpi-card__head">
            <span>2. Freelas B2B no Mês</span>
            ${Icons.render('briefcase', 'icon--sm')}
          </div>
          <div class="kpi-card__value text-info">
            ${Store.formatBRL(fin.activeFreela)}
          </div>
          <div class="kpi-card__foot">
            <span>Meta: ${Store.formatBRL(fin.targetFreelaGoal)} (${state.sales.leads.length} leads)</span>
            <span>Etapa 04 &rarr;</span>
          </div>
        </button>

        <button
          type="button"
          class="card card--interactive"
          data-action="select-stage"
          data-stage="3"
        >
          <div class="kpi-card__head">
            <span>3. Oferta Ativa &amp; Setup</span>
            ${Icons.render('target', 'icon--sm')}
          </div>
          <div class="kpi-card__value">
            ${Store.formatBRL(state.offers.calcSetupPrice)}
          </div>
          <div class="kpi-card__foot">
            <span>${escapeHTML(selectedOffer.shortName)}</span>
            <span>Etapa 03 &rarr;</span>
          </div>
        </button>

        <button
          type="button"
          class="card card--interactive card--status-warning"
          data-action="select-stage"
          data-stage="9"
        >
          <div class="kpi-card__head">
            <span>4. Empréstimo &amp; Prontidão Dev</span>
            ${Icons.render('landmark', 'icon--sm')}
          </div>
          <div class="kpi-card__value text-warning">
            ${paidInstallments}/10 <span style="font-size: 0.85rem; font-weight: 500;">parcelas</span>
          </div>
          <div class="kpi-card__foot">
            <span>Score Carreira: ${careerDone}/${careerTotal}</span>
            <span>Etapa 09 &rarr;</span>
          </div>
        </button>
      </section>

      <section class="card">
        <div class="utility-row" style="margin-bottom: 0.75rem;">
          <div>
            <h2 style="font-size: 1rem;">Termômetro de Reversão do Déficit &amp; Meta de Caixa</h2>
            <p class="text-muted" style="font-size: 0.78rem; margin-top: 0.2rem;">
              Sem cortes e sem freelas, o orçamento original fecha em <strong class="text-negative">${Store.formatBRL(fin.originalDeficitWithoutFreela)}</strong>. Com cortes ativos e a meta de <strong class="text-positive">${Store.formatBRL(fin.targetFreelaGoal)}</strong> em projetos B2B, o mês projeta <strong class="text-positive">+${Store.formatBRL(fin.projectedBalanceWithGoal)}</strong>.
            </p>
          </div>
          <span class="badge ${fin.netBalance >= 0 ? 'badge--success' : 'badge--danger'}">
            ${fin.netBalance >= 0 ? 'SUPERÁVIT ATINGIDO' : `FALTAM ${Store.formatBRL(fin.freelaNeededToBreakEven)} P/ ZERO A ZERO`}
          </span>
        </div>

        <div class="thermometer-track" role="progressbar" aria-label="Termômetro de reversão financeira" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${thermoPct}">
          <div
            class="thermometer-fill ${fin.netBalance >= 0 ? 'thermometer-fill--positive' : 'thermometer-fill--negative'}"
            style="width: ${Math.max(6, thermoPct)}%;"
          ></div>
        </div>

        <div class="thermometer-scale">
          <span>Cenário Base (${Store.formatBRL(fin.originalDeficitWithoutFreela)})</span>
          <span>Após Cortes (${Store.formatBRL(fin.deficitWithActiveCutsWithoutFreela)})</span>
          <span>Ponto de Equilíbrio (R$ 0,00)</span>
          <span>Superávit Alvo (+${Store.formatBRL(fin.projectedBalanceWithGoal)})</span>
        </div>
      </section>

      <section class="form-stack">
        <div class="utility-row">
          <h2 style="font-size: 1rem;">Mapa Operacional das 10 Etapas</h2>
          <span class="text-muted" style="font-size: 0.75rem;">Selecione qualquer módulo para executar ou atualizar indicadores</span>
        </div>
        <div class="grid-3col">
          ${stageCardsHtml}
        </div>
      </section>
    `;
  }

  function renderStage1() {
    const state = Store.getState();
    const f = state.finances;
    const fin = Store.calculateFinancialSummary();

    const expensesRowsHtml = f.expenses
      .map((exp, idx) => {
        const activeVal = exp.useWarTarget ? exp.warTarget : exp.current;
        const diff = (Number(exp.current) || 0) - activeVal;

        return `
          <tr>
            <td>
              <div style="font-weight: 600;">${escapeHTML(exp.name)}</div>
              <div style="margin-top: 0.2rem;">
                <span class="badge ${exp.fixed ? '' : 'badge--warning'}">${exp.fixed ? 'Custo Fixo' : 'Variável Ajustável'}</span>
              </div>
            </td>
            <td>
              <label class="sr-only" for="expCycle_${idx}">Ciclo de vencimento de ${escapeHTML(exp.name)}</label>
              <select
                id="expCycle_${idx}"
                class="form-select form-select--sm"
                data-action="update-expense-cycle"
                data-index="${idx}"
              >
                <option value="Dia 01" ${exp.cycle === 'Dia 01' ? 'selected' : ''}>Dia 01</option>
                <option value="Dia 15" ${exp.cycle === 'Dia 15' ? 'selected' : ''}>Dia 15</option>
                <option value="Mensal" ${exp.cycle === 'Mensal' ? 'selected' : ''}>Mensal</option>
              </select>
            </td>
            <td>
              <label class="sr-only" for="expCurrent_${idx}">Valor atual de ${escapeHTML(exp.name)}</label>
              <input
                id="expCurrent_${idx}"
                type="number"
                step="10"
                min="0"
                class="form-input form-input--sm form-input--mono"
                value="${Number(exp.current) || 0}"
                data-action="update-expense-field"
                data-index="${idx}"
                data-field="current"
              />
            </td>
            <td>
              <label class="sr-only" for="expWar_${idx}">Meta de guerra para ${escapeHTML(exp.name)}</label>
              <input
                id="expWar_${idx}"
                type="number"
                step="10"
                min="0"
                class="form-input form-input--sm form-input--mono"
                value="${Number(exp.warTarget) || 0}"
                data-action="update-expense-field"
                data-index="${idx}"
                data-field="warTarget"
              />
            </td>
            <td style="text-align: center;">
              <input
                type="checkbox"
                class="checkbox-input"
                aria-label="Ativar meta de corte para ${escapeHTML(exp.name)}"
                ${exp.useWarTarget ? 'checked' : ''}
                data-action="toggle-expense-war-mode"
                data-index="${idx}"
              />
            </td>
            <td class="text-mono" style="text-align: right; font-weight: 700;">
              <div>${Store.formatBRL(activeVal)}</div>
              ${diff > 0 ? `<div class="text-positive" style="font-size: 0.68rem;">Poupa ${Store.formatBRL(diff)}</div>` : ''}
            </td>
            <td style="text-align: center;">
              ${
                !exp.fixed
                  ? `<button
                      type="button"
                      class="btn btn--icon btn--ghost btn--danger-hover"
                      data-action="remove-expense"
                      data-index="${idx}"
                      aria-label="Remover despesa ${escapeHTML(exp.name)}"
                      title="Remover despesa"
                    >
                      ${Icons.render('trash', 'icon--sm')}
                    </button>`
                  : `<span class="text-muted" style="font-size: 0.7rem;">Fixo</span>`
              }
            </td>
          </tr>
        `;
      })
      .join('');

    return `
      ${renderStageHeader(
        1,
        'Estancar o déficit mensal, blindar o aluguel na quinzena do Dia 15 e sincronizar entradas reais de freelas.'
      )}

      <div class="grid-sidebar-layout">
        <div class="form-stack">
          <section class="card form-stack">
            <div class="utility-row">
              <h2 style="font-size: 1rem;">Entradas Mensais (CLT + VA + Freelas)</h2>
              <span class="badge badge--success">Total: ${Store.formatBRL(fin.totalIncome)}</span>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="finIncomeDay15">Salário Dia 15 (R$)</label>
                <input
                  id="finIncomeDay15"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-input form-input--mono"
                  value="${f.incomeDay15}"
                  data-action="update-finance-field"
                  data-field="incomeDay15"
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="finIncomeDay01">Salário Dia 01 (R$)</label>
                <input
                  id="finIncomeDay01"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-input form-input--mono"
                  value="${f.incomeDay01}"
                  data-action="update-finance-field"
                  data-field="incomeDay01"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="finIncomeVA">Vale Alimentação VA (R$)</label>
                <input
                  id="finIncomeVA"
                  type="number"
                  step="10"
                  min="0"
                  class="form-input form-input--mono"
                  value="${f.incomeVA}"
                  data-action="update-finance-field"
                  data-field="incomeVA"
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="finExtraManual">Freela Extra Manual (R$)</label>
                <input
                  id="finExtraManual"
                  type="number"
                  step="50"
                  min="0"
                  class="form-input form-input--mono"
                  value="${f.extraFreelaManual}"
                  data-action="update-finance-field"
                  data-field="extraFreelaManual"
                />
              </div>
            </div>

            <label class="checkbox-card ${f.syncFreelaWithCRM ? 'is-done' : ''}">
              <span class="checkbox-card__left">
                <input
                  type="checkbox"
                  class="checkbox-input"
                  ${f.syncFreelaWithCRM ? 'checked' : ''}
                  data-action="toggle-crm-sync"
                />
                <span>
                  <strong style="display: block; font-size: 0.8rem;">Sincronizar automaticamente com o Mini-CRM (Etapa 4)</strong>
                  <span class="text-muted" style="font-size: 0.74rem;">
                    Soma 50% nos leads com status "Fechado 50% Pix" e 100% em "Entregue 100%" (Atual: <strong class="text-positive">${Store.formatBRL(fin.crmFreela)}</strong>)
                  </span>
                </span>
              </span>
            </label>
          </section>

          <section class="card card--status-info form-stack">
            <div class="utility-row">
              <h2 style="font-size: 0.95rem;">Engenharia Quinzenal (Cofre Dia 15 vs Dia 01)</h2>
              <span class="badge badge--info">Anti-Juros</span>
            </div>
            <p class="text-muted" style="font-size: 0.78rem;">
              O salário do <strong>Dia 01 (${Store.formatBRL(f.incomeDay01)})</strong> sozinho não cobre <strong>Aluguel + Condomínio (${Store.formatBRL(fin.rentAmount + 500)})</strong>. Por isso, a sobra do Dia 15 deve ser travada imediatamente em Caixinha CDI separada.
            </p>

            <div class="card card--elevated form-stack" style="gap: 0.5rem;">
              <div class="utility-row" style="font-size: 0.78rem;">
                <span class="text-muted">1. Recebimento Dia 15:</span>
                <strong class="text-mono text-positive">+ ${Store.formatBRL(f.incomeDay15)}</strong>
              </div>
              <div class="utility-row" style="font-size: 0.78rem;">
                <span class="text-muted">2. Contas do Ciclo Dia 15 (Luz + Net + Empréstimo):</span>
                <strong class="text-mono text-negative">- ${Store.formatBRL(fin.day15Expenses)}</strong>
              </div>
              <div class="utility-row" style="padding-top: 0.5rem; border-top: 1px solid var(--border-subtle); font-size: 0.82rem;">
                <strong>Transferir no Dia 15 para "Cofre Aluguel":</strong>
                <strong class="text-mono text-info">${Store.formatBRL(Math.max(0, fin.day15LeftoverForRentVault))}</strong>
              </div>
            </div>
          </section>
        </div>

        <section class="card form-stack">
          <div class="utility-row">
            <div>
              <h2 style="font-size: 1rem;">Matriz de Despesas &amp; Cortes de Guerra</h2>
              <p class="text-muted" style="font-size: 0.75rem;">
                Ative a coluna "Corte Ativo" para simular e aplicar o teto de gastos de guerra.
              </p>
            </div>
            <div class="utility-actions">
              <button
                type="button"
                class="btn btn--primary btn--sm"
                data-action="toggle-all-war-cuts"
                data-enable="true"
              >
                <span>Ativar Cortes</span>
              </button>
              <button
                type="button"
                class="btn btn--secondary btn--sm"
                data-action="toggle-all-war-cuts"
                data-enable="false"
              >
                <span>Ver Original</span>
              </button>
            </div>
          </div>

          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Despesa</th>
                  <th>Ciclo</th>
                  <th>Atual (R$)</th>
                  <th>Meta Guerra (R$)</th>
                  <th style="text-align: center;">Corte Ativo</th>
                  <th style="text-align: right;">Valor Ativo</th>
                  <th style="text-align: center;">Ação</th>
                </tr>
              </thead>
              <tbody>
                ${expensesRowsHtml}
              </tbody>
            </table>
          </div>

          <div class="card card--elevated form-stack">
            <span class="form-label">Adicionar Nova Despesa ao Planejamento</span>
            <div class="form-row">
              <div class="form-group">
                <label class="sr-only" for="newExpName">Nome da nova despesa</label>
                <input
                  id="newExpName"
                  type="text"
                  maxlength="80"
                  placeholder="Nome da despesa (ex: Farmácia)"
                  class="form-input form-input--sm"
                />
              </div>
              <div class="form-group">
                <label class="sr-only" for="newExpValue">Valor em reais</label>
                <input
                  id="newExpValue"
                  type="number"
                  step="10"
                  min="1"
                  placeholder="Valor R$"
                  class="form-input form-input--sm form-input--mono"
                />
              </div>
              <div class="form-group">
                <label class="sr-only" for="newExpCycle">Ciclo de pagamento</label>
                <select id="newExpCycle" class="form-select form-select--sm">
                  <option value="Mensal">Mensal</option>
                  <option value="Dia 01">Dia 01</option>
                  <option value="Dia 15">Dia 15</option>
                </select>
              </div>
              <button type="button" class="btn btn--secondary btn--sm" data-action="add-expense">
                ${Icons.render('plus', 'icon--sm')}
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          <div class="grid-kpi">
            <div class="card card--elevated">
              <span class="text-muted" style="font-size: 0.72rem;">Despesas Sem Corte</span>
              <div class="text-mono" style="font-size: 1.15rem; font-weight: 700; margin-top: 0.25rem;">
                ${Store.formatBRL(fin.totalBaselineExpenses)}
              </div>
            </div>
            <div class="card card--elevated">
              <span class="text-muted" style="font-size: 0.72rem;">Despesas Ativas (Economia: ${Store.formatBRL(fin.savingsFromCuts)})</span>
              <div class="text-mono text-info" style="font-size: 1.15rem; font-weight: 700; margin-top: 0.25rem;">
                ${Store.formatBRL(fin.totalActiveExpenses)}
              </div>
            </div>
            <div class="card card--elevated ${fin.netBalance >= 0 ? 'card--status-positive' : 'card--status-negative'}">
              <span class="text-muted" style="font-size: 0.72rem;">Resultado Final do Mês</span>
              <div class="text-mono ${fin.netBalance >= 0 ? 'text-positive' : 'text-negative'}" style="font-size: 1.15rem; font-weight: 800; margin-top: 0.25rem;">
                ${Store.formatBRL(fin.netBalance)}
              </div>
            </div>
          </div>
        </section>
      </div>

      ${renderStageFooter(1)}
    `;
  }

  function renderStage2() {
    const state = Store.getState();
    const s = state.schedule;
    const blocks = Catalog.SCHEDULE_BLOCKS[s.activeTab] || Catalog.SCHEDULE_BLOCKS.seg_qui;
    const doneCount = s.dailyHabits.filter((h) => h.done).length;
    const pct = Math.round((doneCount / s.dailyHabits.length) * 100);

    const scheduleRowsHtml = blocks
      .map(
        (b) => `
        <div class="card card--elevated utility-row">
          <div style="display: flex; align-items: flex-start; gap: 0.85rem;">
            <span class="badge badge--info text-mono">${escapeHTML(b.time)}</span>
            <div>
              <h3 style="font-size: 0.88rem; font-weight: 700;">${escapeHTML(b.block)}</h3>
              <p class="text-muted" style="font-size: 0.76rem; margin-top: 0.15rem;">${escapeHTML(b.desc)}</p>
            </div>
          </div>
          <span class="badge">${escapeHTML(b.tag)}</span>
        </div>
      `
      )
      .join('');

    const habitsHtml = s.dailyHabits
      .map(
        (h, idx) => `
        <label class="checkbox-card ${h.done ? 'is-done' : ''}">
          <span class="checkbox-card__left">
            <input
              type="checkbox"
              class="checkbox-input"
              ${h.done ? 'checked' : ''}
              data-action="toggle-habit"
              data-index="${idx}"
            />
            <span>
              <span class="badge badge--info" style="margin-bottom: 0.25rem;">${escapeHTML(h.time)}</span>
              <span class="checkbox-card__title" style="display: block;">${escapeHTML(h.label)}</span>
            </span>
          </span>
        </label>
      `
      )
      .join('');

    return `
      ${renderStageHeader(
        2,
        'Alocação cirúrgica de energia aproveitando os 4 dias de Home Office (07:30 às 17:18) sem sacrificar as 6h15 de sono.'
      )}

      <div class="grid-sidebar-layout">
        <section class="card form-stack">
          <div class="subnav" role="tablist" aria-label="Dias da semana">
            <button
              type="button"
              role="tab"
              aria-selected="${s.activeTab === 'seg_qui' ? 'true' : 'false'}"
              class="subnav__btn ${s.activeTab === 'seg_qui' ? 'is-active' : ''}"
              data-action="set-schedule-tab"
              data-tab="seg_qui"
            >
              <span>Seg a Qui (Home Office)</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected="${s.activeTab === 'sexta' ? 'true' : 'false'}"
              class="subnav__btn ${s.activeTab === 'sexta' ? 'is-active' : ''}"
              data-action="set-schedule-tab"
              data-tab="sexta"
            >
              <span>Sexta (Presencial)</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected="${s.activeTab === 'sabado' ? 'true' : 'false'}"
              class="subnav__btn ${s.activeTab === 'sabado' ? 'is-active' : ''}"
              data-action="set-schedule-tab"
              data-tab="sabado"
            >
              <span>Sábado (Deep Work)</span>
            </button>
          </div>

          <div class="form-stack" style="gap: 0.65rem;">
            ${scheduleRowsHtml}
          </div>

          <div class="card card--status-warning">
            <strong class="text-warning" style="font-size: 0.8rem; display: block;">
              Diretriz Anti-Burnout (Domingo Livre e 6h15 de Sono)
            </strong>
            <p class="text-muted" style="font-size: 0.76rem; margin-top: 0.25rem;">
              Dormir menos de 6h destrói a retenção de vocabulário em inglês e a capacidade de resolver bugs em código. O domingo é 100% livre para descanso e família.
            </p>
          </div>
        </section>

        <section class="card form-stack">
          <div class="utility-row">
            <div>
              <h2 style="font-size: 1rem;">Checklist Diário de Execução</h2>
              <p class="text-muted" style="font-size: 0.75rem;">Marque os blocos concluídos hoje</p>
            </div>
            <div class="utility-actions">
              <span class="badge badge--success">Sequência: ${s.streakDays} dia(s)</span>
              <button type="button" class="btn btn--secondary btn--sm" data-action="increment-streak">
                ${Icons.render('plus', 'icon--sm')}
                <span>1 Dia</span>
              </button>
              <button type="button" class="btn btn--ghost btn--sm" data-action="reset-streak">
                <span>Zerar</span>
              </button>
            </div>
          </div>

          <div>
            <div class="utility-row" style="font-size: 0.75rem; margin-bottom: 0.35rem;">
              <span class="text-muted">Progresso Diário</span>
              <strong class="text-mono text-positive">${doneCount}/${s.dailyHabits.length} (${pct}%)</strong>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${pct}%;"></div>
            </div>
          </div>

          <div class="form-stack" style="gap: 0.65rem;">
            ${habitsHtml}
          </div>

          <button type="button" class="btn btn--secondary btn--sm btn--block" data-action="reset-daily-habits">
            <span>Desmarcar Todos para Iniciar Novo Dia</span>
          </button>
        </section>
      </div>

      ${renderStageFooter(2)}
    `;
  }

  function renderStage3() {
    const state = Store.getState();
    const o = state.offers;
    const fin = Store.calculateFinancialSummary();

    const setup = Number(o.calcSetupPrice) || 1100;
    const monthly = Number(o.calcMonthlyFee) || 200;
    const target = Number(o.calcTargetIncome) || 2000;
    const projectsNeeded = Math.ceil(target / setup);
    const halfPix = setup * 0.5;
    const threeMonthsMRR = projectsNeeded * 3 * monthly;

    const offersCardsHtml = Object.values(Catalog.OFFERS_CATALOG)
      .map((offer) => {
        const isSelected = Number(o.selectedOfferId) === offer.id;
        const highlightsHtml = offer.highlights
          .map(
            (h) => `
            <li style="display: flex; align-items: flex-start; gap: 0.45rem; font-size: 0.75rem; color: var(--text-secondary);">
              <span class="text-positive" style="margin-top: 0.1rem;">${Icons.render('check', 'icon--sm')}</span>
              <span>${escapeHTML(h)}</span>
            </li>
          `
          )
          .join('');

        return `
          <div class="card ${isSelected ? 'card--status-positive' : ''} form-stack" style="justify-content: space-between;">
            <div class="form-stack" style="gap: 0.75rem;">
              <div class="utility-row">
                <span class="badge ${isSelected ? 'badge--success' : 'badge--info'}">OFERTA #0${offer.id}</span>
                <span class="badge">${escapeHTML(offer.deliveryTime)}</span>
              </div>
              <h3 style="font-size: 1rem;">${escapeHTML(offer.title)}</h3>
              <p class="text-muted" style="font-size: 0.76rem;">${escapeHTML(offer.problem)}</p>

              <div class="card card--elevated" style="padding: 0.75rem;">
                <span class="text-mono text-info" style="font-size: 0.68rem; text-transform: uppercase; font-weight: 700;">Stack Oficial &amp; Portfólio</span>
                <p class="text-mono" style="font-size: 0.73rem; margin-top: 0.25rem;">${escapeHTML(offer.stack)}</p>
              </div>

              <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.4rem;">
                ${highlightsHtml}
              </ul>
            </div>

            <div class="form-stack" style="gap: 0.65rem; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle);">
              <div class="utility-row">
                <div>
                  <span class="text-muted" style="font-size: 0.68rem; display: block;">Setup Sugerido</span>
                  <strong class="text-mono" style="font-size: 1rem;">${Store.formatBRL(offer.defaultSetup)}</strong>
                </div>
                <div style="text-align: right;">
                  <span class="text-muted" style="font-size: 0.68rem; display: block;">Recorrência</span>
                  <strong class="text-mono text-positive" style="font-size: 0.9rem;">+${Store.formatBRL(offer.defaultMonthly)}/mês</strong>
                </div>
              </div>

              <button
                type="button"
                class="btn ${isSelected ? 'btn--primary' : 'btn--secondary'} btn--sm btn--block"
                data-action="select-main-offer"
                data-offer-id="${offer.id}"
              >
                ${Icons.render('target', 'icon--sm')}
                <span>${isSelected ? 'Oferta Principal Selecionada' : 'Definir como Oferta Foco'}</span>
              </button>
            </div>
          </div>
        `;
      })
      .join('');

    return `
      ${renderStageHeader(
        3,
        'Três produtos enxutos que resolvem dores financeiras imediatas de empresas locais e viram peças de engenharia no GitHub.'
      )}

      <section class="grid-3col">
        ${offersCardsHtml}
      </section>

      <section class="card">
        <div class="grid-2col">
          <div class="form-stack">
            <div>
              <h2 style="font-size: 1rem;">Simulador de Ticket, Meta &amp; Recorrência B2B</h2>
              <p class="text-muted" style="font-size: 0.76rem; margin-top: 0.2rem;">
                Ajuste os parâmetros para atualizar automaticamente os valores nos Scripts Comerciais (Etapa 4).
              </p>
            </div>

            <div class="form-group">
              <label class="form-label" for="rangeSetupPrice">
                <span>Valor de Setup por Projeto</span>
                <strong class="text-mono text-positive">${Store.formatBRL(setup)}</strong>
              </label>
              <input
                id="rangeSetupPrice"
                type="range"
                min="600"
                max="3000"
                step="50"
                value="${setup}"
                class="form-range"
                data-action="update-offer-calc"
                data-field="calcSetupPrice"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="rangeMonthlyFee">
                <span>Mensalidade de Suporte / Hospedagem</span>
                <strong class="text-mono text-info">${Store.formatBRL(monthly)}/mês</strong>
              </label>
              <input
                id="rangeMonthlyFee"
                type="range"
                min="0"
                max="500"
                step="25"
                value="${monthly}"
                class="form-range"
                data-action="update-offer-calc"
                data-field="calcMonthlyFee"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="rangeTargetIncome">
                <span>Meta Mensal de Renda Extra</span>
                <strong class="text-mono text-warning">${Store.formatBRL(target)}/mês</strong>
              </label>
              <input
                id="rangeTargetIncome"
                type="range"
                min="800"
                max="5000"
                step="100"
                value="${target}"
                class="form-range"
                data-action="update-offer-calc"
                data-field="calcTargetIncome"
              />
            </div>
          </div>

          <div class="card card--elevated form-stack" style="justify-content: space-between;">
            <span class="text-mono text-info" style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700;">
              Esforço Comercial Necessário no Mês
            </span>

            <div class="grid-2col" style="gap: 0.75rem;">
              <div class="card">
                <span class="text-muted" style="font-size: 0.72rem;">Projetos Fechados / Mês</span>
                <div class="text-mono" style="font-size: 1.5rem; font-weight: 800; margin-top: 0.2rem;">
                  ${projectsNeeded} <span style="font-size: 0.8rem; font-weight: 500;">cliente(s)</span>
                </div>
                <span class="text-positive" style="font-size: 0.7rem;">Total Setup: ${Store.formatBRL(projectsNeeded * setup)}</span>
              </div>

              <div class="card">
                <span class="text-muted" style="font-size: 0.72rem;">Entrada Imediata (50% Pix)</span>
                <div class="text-mono text-positive" style="font-size: 1.5rem; font-weight: 800; margin-top: 0.2rem;">
                  ${Store.formatBRL(halfPix)}
                </div>
                <span class="text-muted" style="font-size: 0.7rem;">No ato por contrato fechado</span>
              </div>
            </div>

            <div class="card form-stack" style="gap: 0.4rem;">
              <div class="utility-row" style="font-size: 0.78rem;">
                <span class="text-muted">Recorrência Acumulada após 90 dias (${projectsNeeded * 3} clientes):</span>
                <strong class="text-mono text-info">+${Store.formatBRL(threeMonthsMRR)}/mês fixos</strong>
              </div>
              <div class="utility-row" style="font-size: 0.78rem; padding-top: 0.4rem; border-top: 1px solid var(--border-subtle);">
                <span class="text-muted">Balanço Mensal Projetado (CLT + Meta Freela - Despesas):</span>
                <strong class="text-mono ${fin.projectedBalanceWithGoal >= 0 ? 'text-positive' : 'text-negative'}">
                  ${Store.formatBRL(fin.projectedBalanceWithGoal)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      ${renderStageFooter(3)}
    `;
  }

  function renderStage4CRMSubTab(state, crmTotal) {
    const s = state.sales;
    const statuses = ['Prospecção', 'Respondeu', 'Reunião', 'Fechado 50% Pix', 'Entregue 100%'];

    const statusBadgesHtml = statuses
      .map((st) => {
        const count = s.leads.filter((l) => l.status === st).length;
        const badgeType =
          st === 'Entregue 100%'
            ? 'badge--purple'
            : st === 'Fechado 50% Pix'
            ? 'badge--success'
            : st === 'Reunião'
            ? 'badge--warning'
            : st === 'Respondeu'
            ? 'badge--info'
            : '';
        return `<span class="badge ${badgeType}">${escapeHTML(st)}: ${count}</span>`;
      })
      .join('');

    const leadsRowsHtml =
      s.leads.length === 0
        ? `<tr>
            <td colspan="5">
              <div class="empty-state">
                <p class="text-muted" style="font-size: 0.82rem;">Nenhum lead cadastrado no funil. Adicione manualmente abaixo ou capture empresas reais na aba <strong>Radar Geográfico</strong>.</p>
              </div>
            </td>
          </tr>`
        : s.leads
            .map(
              (lead, idx) => `
              <tr>
                <td>
                  <div style="font-weight: 700;">${escapeHTML(lead.company)}</div>
                  <div class="text-muted" style="font-size: 0.72rem;">${escapeHTML(lead.niche)}</div>
                  ${lead.notes ? `<div class="text-info" style="font-size: 0.7rem; margin-top: 0.15rem;">${escapeHTML(lead.notes)}</div>` : ''}
                </td>
                <td>
                  <label class="sr-only" for="leadOffer_${idx}">Oferta para ${escapeHTML(lead.company)}</label>
                  <select
                    id="leadOffer_${idx}"
                    class="form-select form-select--sm"
                    data-action="update-lead-field"
                    data-index="${idx}"
                    data-field="offerId"
                  >
                    <option value="1" ${Number(lead.offerId) === 1 ? 'selected' : ''}>#1 WhatsApp IA</option>
                    <option value="2" ${Number(lead.offerId) === 2 ? 'selected' : ''}>#2 Landing Next.js</option>
                    <option value="3" ${Number(lead.offerId) === 3 ? 'selected' : ''}>#3 Automação PDF</option>
                  </select>
                </td>
                <td>
                  <label class="sr-only" for="leadSetup_${idx}">Valor de setup para ${escapeHTML(lead.company)}</label>
                  <input
                    id="leadSetup_${idx}"
                    type="number"
                    step="50"
                    min="0"
                    class="form-input form-input--sm form-input--mono"
                    value="${Number(lead.setupValue) || 0}"
                    data-action="update-lead-field"
                    data-index="${idx}"
                    data-field="setupValue"
                  />
                </td>
                <td>
                  <label class="sr-only" for="leadStatus_${idx}">Status do funil para ${escapeHTML(lead.company)}</label>
                  <select
                    id="leadStatus_${idx}"
                    class="form-select form-select--sm"
                    data-action="update-lead-field"
                    data-index="${idx}"
                    data-field="status"
                  >
                    ${statuses
                      .map(
                        (st) =>
                          `<option value="${escapeHTML(st)}" ${lead.status === st ? 'selected' : ''}>${escapeHTML(st)}</option>`
                      )
                      .join('')}
                  </select>
                </td>
                <td style="text-align: right;">
                  <div class="utility-actions" style="justify-content: flex-end;">
                    <button
                      type="button"
                      class="btn btn--secondary btn--sm"
                      data-action="load-lead-into-script"
                      data-index="${idx}"
                      title="Personalizar script para esta empresa"
                    >
                      ${Icons.render('terminal', 'icon--sm')}
                      <span>Script</span>
                    </button>
                    <button
                      type="button"
                      class="btn btn--icon btn--ghost btn--danger-hover"
                      data-action="remove-lead"
                      data-index="${idx}"
                      aria-label="Excluir lead ${escapeHTML(lead.company)}"
                      title="Excluir lead"
                    >
                      ${Icons.render('trash', 'icon--sm')}
                    </button>
                  </div>
                </td>
              </tr>
            `
            )
            .join('');

    return `
      <section class="card form-stack">
        <div class="utility-row">
          <div>
            <h2 style="font-size: 1rem;">Mini-CRM de Prospecção B2B (Sincronizado ao Fluxo de Caixa)</h2>
            <p class="text-muted" style="font-size: 0.76rem; margin-top: 0.2rem;">
              Mudar um lead para <strong>Fechado 50% Pix</strong> ou <strong>Entregue 100%</strong> atualiza imediatamente o saldo na Etapa 1.
            </p>
          </div>
          <div class="card card--elevated" style="padding: 0.5rem 0.85rem;">
            <span class="text-muted" style="font-size: 0.68rem; display: block;">Receita Realizada no CRM</span>
            <strong class="text-mono text-positive" style="font-size: 1.05rem;">${Store.formatBRL(crmTotal)}</strong>
          </div>
        </div>

        <div class="utility-actions">
          ${statusBadgesHtml}
        </div>

        <div class="card card--elevated form-stack">
          <span class="form-label">Cadastrar Lead Manualmente no Funil</span>
          <div class="form-row">
            <div class="form-group">
              <label class="sr-only" for="newLeadCompany">Nome da empresa</label>
              <input
                id="newLeadCompany"
                type="text"
                maxlength="90"
                placeholder="Empresa (ex: Clínica Odonto Sul)"
                class="form-input form-input--sm"
              />
            </div>
            <div class="form-group">
              <label class="sr-only" for="newLeadNiche">Nicho da empresa</label>
              <input
                id="newLeadNiche"
                type="text"
                maxlength="70"
                placeholder="Nicho (ex: Odontologia)"
                class="form-input form-input--sm"
              />
            </div>
            <div class="form-group">
              <label class="sr-only" for="newLeadOffer">Oferta inicial</label>
              <select id="newLeadOffer" class="form-select form-select--sm">
                <option value="1">Oferta #1 (WhatsApp IA)</option>
                <option value="2">Oferta #2 (Landing Next.js)</option>
                <option value="3">Oferta #3 (Automação PDF)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="sr-only" for="newLeadValue">Valor de setup em reais</label>
              <input
                id="newLeadValue"
                type="number"
                step="50"
                min="100"
                value="${state.offers.calcSetupPrice}"
                class="form-input form-input--sm form-input--mono"
              />
            </div>
            <button type="button" class="btn btn--primary btn--sm" data-action="add-lead">
              ${Icons.render('plus', 'icon--sm')}
              <span>Adicionar Lead</span>
            </button>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Empresa / Nicho / Observação</th>
                <th>Oferta</th>
                <th>Setup (R$)</th>
                <th>Status no Funil</th>
                <th style="text-align: right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${leadsRowsHtml}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderStage4RadarSubTab(state) {
    const s = state.sales;
    const radar = s.radar || {
      nicheKey: 'dentist',
      ringIndex: 0,
      results: [],
      seenKeys: [],
      lastSearchInfo: '',
      isLoading: false
    };

    const currentRing = Catalog.RADAR_RINGS[radar.ringIndex] || Catalog.RADAR_RINGS[0];
    const currentNiche = Catalog.RADAR_NICHES[radar.nicheKey] || Catalog.RADAR_NICHES.dentist;
    const sessionSerperKey = Store.getSerperApiKey();
    const googleMapsQuery = encodeURIComponent(`${currentNiche.searchKeyword} em ${currentRing.regionQuery}`);

    const resultsHtml =
      Array.isArray(radar.results) && radar.results.length > 0
        ? `<div class="grid-3col">
            ${radar.results
              .map((item, idx) => {
                const safeWebsite = sanitizeUrl(item.website);
                const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${item.name} ${item.city || 'Joinville'}`
                )}`;

                return `
                  <article class="card card--elevated form-stack" style="justify-content: space-between;">
                    <div class="form-stack" style="gap: 0.5rem;">
                      <div class="utility-row">
                        <span class="badge badge--info">${escapeHTML(item.nicheLabel || currentNiche.label)}</span>
                        <div class="utility-actions">
                          ${item.distanceKm ? `<span class="badge badge--success">${escapeHTML(item.distanceKm)} km</span>` : ''}
                          <button
                            type="button"
                            class="btn btn--icon btn--ghost btn--danger-hover"
                            style="width: 2rem; height: 2rem; min-height: 2rem;"
                            data-action="discard-radar-buyer"
                            data-index="${idx}"
                            aria-label="Descartar empresa ${escapeHTML(item.name)}"
                            title="Descartar para não repetir"
                          >
                            ${Icons.render('close', 'icon--sm')}
                          </button>
                        </div>
                      </div>

                      <h3 style="font-size: 0.92rem;">${escapeHTML(item.name)}</h3>
                      <p class="text-muted" style="font-size: 0.74rem;">
                        ${escapeHTML(item.address || currentRing.shortLabel)}
                      </p>

                      ${
                        item.phone
                          ? `<div class="text-mono text-positive" style="font-size: 0.75rem; font-weight: 600;">
                              Tel: ${escapeHTML(item.phone)}
                            </div>`
                          : `<div class="text-muted" style="font-size: 0.72rem;">Telefone via Google Maps</div>`
                      }

                      ${
                        safeWebsite
                          ? `<div style="font-size: 0.72rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                              <a href="${escapeHTML(safeWebsite)}" target="_blank" rel="noopener noreferrer">
                                ${escapeHTML(item.website)}
                              </a>
                            </div>`
                          : ''
                      }
                    </div>

                    <div class="utility-actions" style="padding-top: 0.65rem; border-top: 1px solid var(--border-subtle);">
                      <button
                        type="button"
                        class="btn btn--primary btn--sm"
                        style="flex: 1;"
                        data-action="import-radar-buyer"
                        data-index="${idx}"
                      >
                        ${Icons.render('plus', 'icon--sm')}
                        <span>CRM &amp; Script</span>
                      </button>
                      <a
                        href="${mapsSearchUrl}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn btn--secondary btn--sm"
                        aria-label="Ver ${escapeHTML(item.name)} no Google Maps"
                      >
                        ${Icons.render('externalLink', 'icon--sm')}
                        <span>Maps</span>
                      </a>
                    </div>
                  </article>
                `;
              })
              .join('')}
          </div>`
        : `<div class="empty-state">
            <p class="text-muted" style="font-size: 0.82rem;">
              Selecione o nicho e o anel de distância acima e clique em <strong>Buscar Compradores no Raio</strong> para localizar empresas reais em Joinville e região.
            </p>
          </div>`;

    return `
      <section class="card form-stack">
        <div class="utility-row">
          <div>
            <div class="stage-header__top">
              <span class="badge badge--info">GEOLOCALIZAÇÃO B2B</span>
              <span class="badge badge--success">Filtro Anti-Repetição (${(radar.seenKeys || []).length} ocultos)</span>
            </div>
            <h2 style="font-size: 1rem; margin-top: 0.35rem;">Radar Geográfico de Compradores (Partindo da Zona Norte de Joinville)</h2>
            <p class="text-muted" style="font-size: 0.76rem;">
              Busca empresas reais do mais próximo (Costa e Silva / América) até cidades vizinhas via OpenStreetMap Overpass ou Serper Google Places.
            </p>
          </div>

          <div class="utility-actions">
            ${
              (radar.seenKeys || []).length > 0
                ? `<button type="button" class="btn btn--ghost btn--sm" data-action="clear-radar-seen">
                    <span>Limpar Histórico (${radar.seenKeys.length})</span>
                  </button>`
                : ''
            }
            <a
              href="https://www.google.com/maps/search/${googleMapsQuery}"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn--secondary btn--sm"
            >
              ${Icons.render('externalLink', 'icon--sm')}
              <span>Abrir Raio no Google Maps</span>
            </a>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="radarNicheSelect">1. Nicho Comprador Alvo</label>
            <select
              id="radarNicheSelect"
              class="form-select form-select--sm"
              data-action="update-radar-config"
              data-field="nicheKey"
            >
              ${Object.values(Catalog.RADAR_NICHES)
                .map(
                  (n) =>
                    `<option value="${escapeHTML(n.key)}" ${radar.nicheKey === n.key ? 'selected' : ''}>${escapeHTML( n.label )} (Oferta #${n.offerId})</option>`
                )
                .join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="radarRingSelect">2. Anel de Distância (Origem: Zona Norte)</label>
            <select
              id="radarRingSelect"
              class="form-select form-select--sm"
              data-action="update-radar-config"
              data-field="ringIndex"
            >
              ${Catalog.RADAR_RINGS.map(
                (r) =>
                  `<option value="${r.index}" ${Number(radar.ringIndex) === r.index ? 'selected' : ''}>${escapeHTML(
                    r.label
                  )}</option>`
              ).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="radarSerperKey">
              <span>3. Chave Serper.dev (Isolada em Sessão)</span>
              <span class="badge">Opcional</span>
            </label>
            <input
              id="radarSerperKey"
              type="password"
              autocomplete="off"
              placeholder="Cole sua API Key Serper.dev (não vai p/ backup)"
              value="${escapeHTML(sessionSerperKey)}"
              class="form-input form-input--sm form-input--mono"
              data-action="update-serper-key"
            />
          </div>

          <div class="form-group" style="justify-content: flex-end;">
            <button
              type="button"
              id="radarSearchBtn"
              class="btn btn--primary btn--sm"
              data-action="search-radar-buyers"
              ${radar.isLoading ? 'disabled aria-busy="true"' : ''}
            >
              ${Icons.render('search', 'icon--sm')}
              <span>${radar.isLoading ? 'Buscando no Raio...' : 'Buscar Compradores no Raio'}</span>
            </button>
          </div>
        </div>

        ${
          radar.lastSearchInfo
            ? `<div class="utility-row" style="font-size: 0.75rem;">
                <span class="text-info">${escapeHTML(radar.lastSearchInfo)}</span>
                <span class="text-muted">Ao clicar em "+ CRM &amp; Script", o comprador entra no funil e não se repete.</span>
              </div>`
            : ''
        }

        ${resultsHtml}
      </section>
    `;
  }

  function renderStage4ScriptsSubTab(state) {
    const s = state.sales;
    const scripts = Store.generateB2BScripts();
    const activeSetup = Store.getDynamicOfferPrice(s.scriptOfferId);

    return `
      <div class="grid-sidebar-layout">
        <section class="card form-stack">
          <div>
            <h2 style="font-size: 1rem;">Configurador de Abordagem Personalizada</h2>
            <p class="text-muted" style="font-size: 0.76rem; margin-top: 0.2rem;">
              Preencha os dados do cliente. Os scripts ao lado são atualizados em tempo real sem perder o foco de digitação.
            </p>
          </div>

          <div class="form-group">
            <label class="form-label" for="salesScriptOffer">Oferta para Abordagem</label>
            <select
              id="salesScriptOffer"
              class="form-select"
              data-action="update-sales-script-offer"
            >
              <option value="1" ${Number(s.scriptOfferId) === 1 ? 'selected' : ''}>Oferta #1: Agente WhatsApp IA (${Store.formatBRL(Store.getDynamicOfferPrice(1))})</option>
              <option value="2" ${Number(s.scriptOfferId) === 2 ? 'selected' : ''}>Oferta #2: Landing Page Next.js (${Store.formatBRL(Store.getDynamicOfferPrice(2))})</option>
              <option value="3" ${Number(s.scriptOfferId) === 3 ? 'selected' : ''}>Oferta #3: Automação Backoffice PDF (${Store.formatBRL(Store.getDynamicOfferPrice(3))})</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="salesCompanyInput">Nome da Empresa</label>
            <input
              id="salesCompanyInput"
              type="text"
              maxlength="80"
              value="${escapeHTML(s.scriptCompanyName)}"
              class="form-input"
              data-action="update-sales-script-text"
              data-field="scriptCompanyName"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="salesContactInput">Nome do Decisor / Contato</label>
              <input
                id="salesContactInput"
                type="text"
                maxlength="60"
                value="${escapeHTML(s.scriptContactName)}"
                class="form-input"
                data-action="update-sales-script-text"
                data-field="scriptContactName"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="salesCityInput">Cidade / Região</label>
              <input
                id="salesCityInput"
                type="text"
                maxlength="60"
                value="${escapeHTML(s.scriptCity)}"
                class="form-input"
                data-action="update-sales-script-text"
                data-field="scriptCity"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="salesNicheInput">Nicho / Segmento</label>
            <input
              id="salesNicheInput"
              type="text"
              maxlength="80"
              value="${escapeHTML(s.scriptNiche)}"
              class="form-input"
              data-action="update-sales-script-text"
              data-field="scriptNiche"
            />
          </div>

          <div class="card card--elevated">
            <div class="utility-row" style="font-size: 0.76rem;">
              <span class="text-muted">Ticket Configurado na Oferta:</span>
              <strong id="salesActiveTicketBadge" class="text-mono text-positive">${Store.formatBRL(activeSetup)} (50% Pix: ${Store.formatBRL(activeSetup * 0.5)})</strong>
            </div>
          </div>
        </section>

        <section class="card form-stack">
          <div class="code-panel">
            <div class="code-panel__header">
              <span class="code-panel__title">1. Primeiro Contato (12:30 – 13:00 • WhatsApp / Direct)</span>
              <button
                type="button"
                class="btn btn--primary btn--sm"
                data-action="copy-element-text"
                data-target="scriptPreInitial"
              >
                ${Icons.render('copy', 'icon--sm')}
                <span>Copiar Abordagem</span>
              </button>
            </div>
            <pre id="scriptPreInitial" class="code-panel__pre">${escapeHTML(scripts.initial)}</pre>
          </div>

          <div class="code-panel">
            <div class="code-panel__header">
              <span class="code-panel__title">2. Follow-up 24h Depois (Convite para Call de 15m após 18:15)</span>
              <button
                type="button"
                class="btn btn--secondary btn--sm"
                data-action="copy-element-text"
                data-target="scriptPreFollowup"
              >
                ${Icons.render('copy', 'icon--sm')}
                <span>Copiar Follow-up</span>
              </button>
            </div>
            <pre id="scriptPreFollowup" class="code-panel__pre">${escapeHTML(scripts.followup)}</pre>
          </div>

          <div class="code-panel">
            <div class="code-panel__header">
              <span class="code-panel__title">3. Roteiro de Call 15m &amp; Fechamento 50% Pix</span>
              <button
                type="button"
                class="btn btn--secondary btn--sm"
                data-action="copy-element-text"
                data-target="scriptPreClosing"
              >
                ${Icons.render('copy', 'icon--sm')}
                <span>Copiar Roteiro Call</span>
              </button>
            </div>
            <pre id="scriptPreClosing" class="code-panel__pre">${escapeHTML(scripts.closingCall)}</pre>
          </div>
        </section>
      </div>
    `;
  }

  function renderStage4() {
    const state = Store.getState();
    const s = state.sales;
    const activeSubTab = ['crm', 'radar', 'scripts'].includes(s.activeSubTab) ? s.activeSubTab : 'crm';
    const crmTotal = Store.calculateCRMClosedIncome();
    const radarCount = Array.isArray(s.radar?.results) ? s.radar.results.length : 0;

    let subTabContentHtml = '';
    if (activeSubTab === 'crm') {
      subTabContentHtml = renderStage4CRMSubTab(state, crmTotal);
    } else if (activeSubTab === 'radar') {
      subTabContentHtml = renderStage4RadarSubTab(state);
    } else {
      subTabContentHtml = renderStage4ScriptsSubTab(state);
    }

    return `
      ${renderStageHeader(
        4,
        'Operação comercial B2B dividida em Funil CRM, Radar Geográfico de Joinville/SC e Gerador de Scripts em tempo real.'
      )}

      <nav class="subnav" role="tablist" aria-label="Ferramentas comerciais da Etapa 4">
        <button
          type="button"
          role="tab"
          aria-selected="${activeSubTab === 'crm' ? 'true' : 'false'}"
          class="subnav__btn ${activeSubTab === 'crm' ? 'is-active' : ''}"
          data-action="set-sales-subtab"
          data-subtab="crm"
        >
          ${Icons.render('briefcase', 'icon--sm')}
          <span>1. Funil CRM B2B (${s.leads.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected="${activeSubTab === 'radar' ? 'true' : 'false'}"
          class="subnav__btn ${activeSubTab === 'radar' ? 'is-active' : ''}"
          data-action="set-sales-subtab"
          data-subtab="radar"
        >
          ${Icons.render('radar', 'icon--sm')}
          <span>2. Radar Geográfico Joinville/SC (${radarCount})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected="${activeSubTab === 'scripts' ? 'true' : 'false'}"
          class="subnav__btn ${activeSubTab === 'scripts' ? 'is-active' : ''}"
          data-action="set-sales-subtab"
          data-subtab="scripts"
        >
          ${Icons.render('terminal', 'icon--sm')}
          <span>3. Gerador de Scripts &amp; Call 15m</span>
        </button>
      </nav>

      ${subTabContentHtml}

      ${renderStageFooter(4)}
    `;
  }

  function updateSalesScriptsDOM() {
    const state = Store.getState();
    const scripts = Store.generateB2BScripts();
    const activeSetup = Store.getDynamicOfferPrice(state.sales.scriptOfferId);

    const elInit = document.getElementById('scriptPreInitial');
    const elFollow = document.getElementById('scriptPreFollowup');
    const elClose = document.getElementById('scriptPreClosing');
    const elBadge = document.getElementById('salesActiveTicketBadge');

    if (elInit) elInit.textContent = scripts.initial;
    if (elFollow) elFollow.textContent = scripts.followup;
    if (elClose) elClose.textContent = scripts.closingCall;
    if (elBadge) {
      elBadge.textContent = `${Store.formatBRL(activeSetup)} (50% Pix: ${Store.formatBRL(activeSetup * 0.5)})`;
    }
  }

  WarRoom.Views = WarRoom.Views || {};
  Object.assign(WarRoom.Views, {
    renderStageHeader,
    renderStageFooter,
    renderStage0,
    renderStage1,
    renderStage2,
    renderStage3,
    renderStage4,
    updateSalesScriptsDOM
  });
})(window);