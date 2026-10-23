// filepath: src/js/app.js
(function initWarRoomApp(global) {
  'use strict';

  const WarRoom = (global.WarRoom = global.WarRoom || {});
  const { Security, Icons, Catalog, Store, Views } = WarRoom;
  const { escapeHTML, clampNumber, normalizeEntityKey } = Security;

  let activeRadarAbortController = null;
  let activeModalConfirmCallback = null;

  const standupTimer = {
    intervalId: null,
    isRunning: false,
    remainingSeconds: 15 * 60,
    lastTickTimestamp: 0
  };

  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const validTypes = ['success', 'warn', 'danger', 'info'];
    const safeType = validTypes.includes(type) ? type : 'success';

    const toastEl = document.createElement('div');
    toastEl.className = `toast toast--${safeType}`;

    const textSpan = document.createElement('span');
    textSpan.textContent = String(message || '');

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'btn btn--icon btn--ghost';
    closeBtn.style.width = '1.75rem';
    closeBtn.style.height = '1.75rem';
    closeBtn.style.minHeight = '1.75rem';
    closeBtn.setAttribute('aria-label', 'Fechar notificação');
    closeBtn.innerHTML = Icons.render('close', 'icon--sm');
    closeBtn.addEventListener('click', () => toastEl.remove());

    toastEl.appendChild(textSpan);
    toastEl.appendChild(closeBtn);
    container.appendChild(toastEl);

    setTimeout(() => {
      if (toastEl.parentNode) {
        toastEl.remove();
      }
    }, 3600);
  }

  function openModal({ title, description, bodyHtml = '', confirmLabel = 'Confirmar', confirmClass = 'btn--primary', onConfirm }) {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    if (!overlay || !content) return;

    activeModalConfirmCallback = typeof onConfirm === 'function' ? onConfirm : null;

    content.innerHTML = `
      <div class="modal-header">
        <h2 id="modalTitle" style="font-size: 1.05rem;">${escapeHTML(title)}</h2>
        <button type="button" class="btn btn--icon btn--ghost" data-action="close-modal" aria-label="Fechar janela">
          ${Icons.render('close', 'icon--sm')}
        </button>
      </div>
      ${description ? `<p class="text-muted" style="font-size: 0.82rem;">${escapeHTML(description)}</p>` : ''}
      ${bodyHtml}
      <div class="modal-footer">
        <button type="button" class="btn btn--secondary btn--sm" data-action="close-modal">Cancelar</button>
        <button type="button" class="btn ${escapeHTML(confirmClass)} btn--sm" data-action="confirm-modal">
          <span>${escapeHTML(confirmLabel)}</span>
        </button>
      </div>
    `;

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    activeModalConfirmCallback = null;
  }

  function updateHeaderMetrics() {
    const state = Store.getState();
    const fin = Store.calculateFinancialSummary();

    const completedCount = Object.values(state.completedStages).filter(Boolean).length;
    const pct = Math.round((completedCount / 10) * 100);

    const progressText = document.getElementById('globalProgressText');
    const progressBar = document.getElementById('globalProgressBar');
    const progressTrack = document.getElementById('globalProgressTrack');

    if (progressText) progressText.textContent = `${pct}%`;
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (progressTrack) progressTrack.setAttribute('aria-valuenow', String(pct));

    const balPill = document.getElementById('headerBalancePill');
    if (balPill) {
      balPill.textContent = `${fin.netBalance >= 0 ? '+' : ''}${Store.formatBRL(fin.netBalance)}`;
      balPill.className = `metric-pill__value ${
        fin.netBalance >= 0 ? 'metric-pill__value--positive' : 'metric-pill__value--negative'
      }`;
    }

    const freelaPill = document.getElementById('headerFreelaPill');
    if (freelaPill) {
      freelaPill.textContent = `${Store.formatBRL(fin.activeFreela)} / ${Store.formatBRL(fin.targetFreelaGoal)}`;
      freelaPill.className = `metric-pill__value ${
        fin.activeFreela >= fin.targetFreelaGoal ? 'metric-pill__value--positive' : 'metric-pill__value--warning'
      }`;
    }

    const offerPill = document.getElementById('headerOfferPill');
    const activeOffer = Catalog.OFFERS_CATALOG[state.offers.selectedOfferId] || Catalog.OFFERS_CATALOG[1];
    if (offerPill) {
      offerPill.textContent = `#${activeOffer.id} ${activeOffer.shortName}`;
    }
  }

  function renderSidebar() {
    const navContainer = document.getElementById('sidebarNavContainer');
    if (!navContainer) return;

    const state = Store.getState();

    navContainer.innerHTML = Catalog.STAGES_META.map((stage) => {
      const isActive = Number(state.currentStage) === stage.id;
      const isCompleted = stage.id > 0 && Boolean(state.completedStages[stage.id]);

      const stateClasses = [
        'sidebar-nav__item',
        isActive ? 'is-active' : '',
        isCompleted ? 'is-completed' : ''
      ]
        .filter(Boolean)
        .join(' ');

      return `
        <button
          type="button"
          class="${stateClasses}"
          data-action="select-stage"
          data-stage="${stage.id}"
          aria-current="${isActive ? 'page' : 'false'}"
        >
          <span class="sidebar-nav__left">
            <span class="sidebar-nav__icon-box">
              ${isCompleted ? Icons.render('check', 'icon--sm') : Icons.render(stage.icon, 'icon--sm')}
            </span>
            <span class="sidebar-nav__text">
              <span class="sidebar-nav__code">${escapeHTML(stage.code)}</span>
              <span class="sidebar-nav__title">${escapeHTML(stage.title)}</span>
            </span>
          </span>
          <span class="badge">${escapeHTML(stage.badge)}</span>
        </button>
      `;
    }).join('');
  }

  function enhanceNumericInputs(rootEl) {
    if (!rootEl) return;
    const numInputs = rootEl.querySelectorAll('input[type="number"]');
    numInputs.forEach((input) => {
      input.setAttribute('inputmode', 'decimal');
      input.setAttribute('autocomplete', 'off');
      if (input.getAttribute('step') !== '0.01' && input.getAttribute('step') !== '0.5') {
        input.setAttribute('step', 'any');
      }
    });
  }

  function renderActiveStage() {
    const container = document.getElementById('stageContainer');
    if (!container) return;

    const state = Store.getState();
    const current = Number(state.currentStage) || 0;

    const stageRenderers = {
      0: Views.renderStage0,
      1: Views.renderStage1,
      2: Views.renderStage2,
      3: Views.renderStage3,
      4: Views.renderStage4,
      5: Views.renderStage5,
      6: Views.renderStage6,
      7: Views.renderStage7,
      8: () => Views.renderStage8(standupTimer),
      9: Views.renderStage9,
      10: Views.renderStage10
    };

    const renderer = stageRenderers[current] || Views.renderStage0;
    container.innerHTML = renderer();
    enhanceNumericInputs(container);
  }

  function syncUI(shouldSave = true) {
    if (shouldSave) {
      Store.saveState();
    }
    updateHeaderMetrics();
    renderSidebar();
    renderActiveStage();
  }

  function toggleMobileSidebar(forceOpen) {
    const sidebar = document.getElementById('appSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    const menuBtn = document.getElementById('mobileMenuBtn');
    if (!sidebar || !backdrop) return;

    const willOpen = typeof forceOpen === 'boolean' ? forceOpen : !sidebar.classList.contains('is-open');
    sidebar.classList.toggle('is-open', willOpen);
    backdrop.classList.toggle('is-open', willOpen);
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    }
  }

  function selectStage(stageId) {
    const state = Store.getState();
    state.currentStage = clampNumber(stageId, 0, 10, 0);
    toggleMobileSidebar(false);
    syncUI(true);

    const mainEl = document.getElementById('mainContent');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  }

  function syncTimerDisplayDOM() {
    const displayEl = document.getElementById('standupTimerDisplay');
    if (!displayEl) return;

    const mins = String(Math.floor(standupTimer.remainingSeconds / 60)).padStart(2, '0');
    const secs = String(standupTimer.remainingSeconds % 60).padStart(2, '0');
    displayEl.textContent = `${mins}:${secs}`;
    displayEl.classList.toggle('is-running', standupTimer.isRunning);
  }

  function stopStandupTimer() {
    if (standupTimer.intervalId) {
      clearInterval(standupTimer.intervalId);
      standupTimer.intervalId = null;
    }
    standupTimer.isRunning = false;
  }

  function toggleStandupTimer() {
    if (standupTimer.isRunning) {
      stopStandupTimer();
      renderActiveStage();
      return;
    }

    standupTimer.isRunning = true;
    standupTimer.lastTickTimestamp = Date.now();

    standupTimer.intervalId = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - standupTimer.lastTickTimestamp) / 1000);
      if (elapsedSeconds < 1) return;

      standupTimer.lastTickTimestamp += elapsedSeconds * 1000;
      standupTimer.remainingSeconds = Math.max(0, standupTimer.remainingSeconds - elapsedSeconds);
      syncTimerDisplayDOM();

      if (standupTimer.remainingSeconds <= 0) {
        stopStandupTimer();
        const state = Store.getState();
        state.english.completedSessions = (Number(state.english.completedSessions) || 0) + 1;
        standupTimer.remainingSeconds = (Number(state.english.timerDurationMinutes) || 15) * 60;
        syncUI(true);
        showToast('Treino de Daily Standup concluído! +1 sessão registrada.', 'success');
      }
    }, 350);

    renderActiveStage();
  }

  async function searchRealBuyersByRadius() {
    const state = Store.getState();
    const radar = state.sales.radar;

    if (activeRadarAbortController) {
      activeRadarAbortController.abort();
    }
    activeRadarAbortController = new AbortController();
    const timeoutId = setTimeout(() => {
      if (activeRadarAbortController) activeRadarAbortController.abort();
    }, 12000);

    const ring = Catalog.RADAR_RINGS[radar.ringIndex] || Catalog.RADAR_RINGS[0];
    const niche = Catalog.RADAR_NICHES[radar.nicheKey] || Catalog.RADAR_NICHES.dentist;
    const serperKey = Store.getSerperApiKey();

    radar.isLoading = true;
    renderActiveStage();

    try {
      let foundList = [];

      if (serperKey) {
        const response = await fetch('https://google.serper.dev/places', {
          method: 'POST',
          headers: {
            'X-API-KEY': serperKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            q: `${niche.searchKeyword} ${ring.regionQuery}`,
            gl: 'br',
            hl: 'pt-br'
          }),
          signal: activeRadarAbortController.signal
        });

        if (response.ok) {
          const data = await response.json();
          const places = Array.isArray(data.places) ? data.places : [];
          foundList = places
            .filter((p) => p && p.title && !Store.isBuyerAlreadySeenOrInCRM(p.title))
            .slice(0, 12)
            .map((p) => ({
              name: String(p.title).trim(),
              nicheLabel: niche.label,
              offerId: niche.offerId,
              address: String(p.address || ring.shortLabel).trim(),
              phone: String(p.phoneNumber || '').trim(),
              website: String(p.website || '').trim(),
              city: ring.city,
              distanceKm:
                p.latitude && p.longitude
                  ? Store.calcDistanceKmFromNorthJoinville(p.latitude, p.longitude)
                  : null
            }));
        }
      }

      if (foundList.length === 0) {
        const overpassQuery = `[out:json][timeout:10];(node[${niche.osmFilter}](around:${ring.radiusMeters},${ring.lat},${ring.lon});way[${niche.osmFilter}](around:${ring.radiusMeters},${ring.lat},${ring.lon}););out center 60;`;
        const osmResponse = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: overpassQuery,
          signal: activeRadarAbortController.signal
        });

        if (osmResponse.ok) {
          const osmData = await osmResponse.json();
          const elements = Array.isArray(osmData.elements) ? osmData.elements : [];

          foundList = elements
            .filter((el) => el.tags && el.tags.name && !Store.isBuyerAlreadySeenOrInCRM(el.tags.name))
            .map((el) => {
              const t = el.tags;
              const lat = el.lat || (el.center && el.center.lat);
              const lon = el.lon || (el.center && el.center.lon);
              const street = [t['addr:street'], t['addr:housenumber'], t['addr:suburb']]
                .filter(Boolean)
                .join(', ');

              return {
                name: String(t.name).trim(),
                nicheLabel: niche.label,
                offerId: niche.offerId,
                address: street || ring.shortLabel,
                phone: String(t.phone || t['contact:phone'] || t['contact:whatsapp'] || '').trim(),
                website: String(t.website || t['contact:website'] || '').trim(),
                city: t['addr:city'] || ring.city,
                distanceKm: lat && lon ? Store.calcDistanceKmFromNorthJoinville(lat, lon) : null
              };
            })
            .sort((a, b) => parseFloat(a.distanceKm || 999) - parseFloat(b.distanceKm || 999))
            .slice(0, 12);
        }
      }

      radar.results = foundList;
      radar.lastSearchInfo =
        foundList.length > 0
          ? `${foundList.length} compradores inéditos localizados em ${ring.shortLabel}.`
          : `Nenhum comprador inédito retornado pela API neste raio. Tente expandir para o próximo Anel de Distância ou abrir no Google Maps.`;

      if (foundList.length > 0) {
        showToast(`${foundList.length} compradores encontrados no raio selecionado.`, 'info');
      } else {
        showToast('Sem novos registros neste anel. Expanda o raio ou consulte o Google Maps.', 'warn');
      }
    } catch (err) {
      if (err && err.name === 'AbortError') {
        radar.lastSearchInfo = 'A consulta geográfica excedeu o tempo limite (12s). Tente novamente ou use a busca direta no Google Maps.';
        showToast('Tempo limite de rede excedido. Use o botão do Google Maps ou tente novamente.', 'warn');
      } else {
        radar.lastSearchInfo = 'Serviço de mapas temporariamente indisponível. Utilize o botão Abrir Raio no Google Maps.';
        showToast('Falha ao consultar API de mapas.', 'danger');
      }
    } finally {
      clearTimeout(timeoutId);
      radar.isLoading = false;
      syncUI(true);
    }
  }

  function exportBackupFile() {
    const jsonString = Store.exportCleanBackupJSON();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `war_room_90d_backup_${dateStamp}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('Backup JSON exportado com segurança (sem chaves de API).', 'success');
  }

  function openImportBackupModal() {
    openModal({
      title: 'Importar Backup JSON',
      description: 'Selecione um arquivo .json exportado anteriormente ou cole o conteúdo abaixo. Todos os campos serão validados antes da importação.',
      bodyHtml: `
        <div class="form-stack">
          <button type="button" class="btn btn--secondary btn--sm" data-action="trigger-file-input">
            <span>Escolher Arquivo .JSON do Computador</span>
          </button>
          <div class="form-group">
            <label class="form-label" for="importJsonTextarea">Ou cole o conteúdo JSON diretamente:</label>
            <textarea
              id="importJsonTextarea"
              class="form-textarea form-input--mono"
              placeholder='{"currentStage": 0, "finances": ...}'
            ></textarea>
          </div>
        </div>
      `,
      confirmLabel: 'Validar e Importar',
      confirmClass: 'btn--primary',
      onConfirm: () => {
        const textarea = document.getElementById('importJsonTextarea');
        const raw = textarea ? textarea.value.trim() : '';
        if (!raw) {
          showToast('Cole um JSON válido ou selecione um arquivo.', 'warn');
          return;
        }
        const result = Store.importFromRawJSON(raw);
        if (!result.ok) {
          showToast(result.error, 'danger');
          return;
        }
        closeModal();
        syncUI(true);
        showToast('Backup validado e restaurado com sucesso!', 'success');
      }
    });
  }

  function handleClickAction(actionEl) {
    const action = actionEl.getAttribute('data-action');
    const state = Store.getState();

    switch (action) {
      case 'select-stage': {
        const stageId = Number(actionEl.getAttribute('data-stage'));
        selectStage(stageId);
        break;
      }

      case 'toggle-sidebar':
        toggleMobileSidebar();
        break;

      case 'close-sidebar':
        toggleMobileSidebar(false);
        break;

      case 'toggle-theme': {
        const nextTheme = Store.toggleTheme();
        showToast(`Tema alterado para modo ${nextTheme === 'light' ? 'Claro Executivo' : 'Dark Carbon'}.`, 'info');
        break;
      }

      case 'export-backup':
        exportBackupFile();
        break;

      case 'open-import-modal':
        openImportBackupModal();
        break;

      case 'trigger-file-input': {
        const fileInput = document.getElementById('importFileInput');
        if (fileInput) fileInput.click();
        break;
      }

      case 'open-reset-modal':
        openModal({
          title: 'Restaurar Dados de Fábrica',
          description: 'Tem certeza que deseja apagar suas edições atuais e restaurar o plano original de 90 dias? Faça um backup antes se desejar preservar seu histórico.',
          confirmLabel: 'Sim, Restaurar Padrão',
          confirmClass: 'btn--danger',
          onConfirm: () => {
            stopStandupTimer();
            Store.resetToDefault();
            standupTimer.remainingSeconds = 15 * 60;
            closeModal();
            syncUI(true);
            showToast('Dados restaurados para a configuração inicial.', 'info');
          }
        });
        break;

      case 'close-modal':
        closeModal();
        break;

      case 'confirm-modal':
        if (typeof activeModalConfirmCallback === 'function') {
          activeModalConfirmCallback();
        }
        break;

      case 'toggle-stage-done': {
        const stageId = Number(actionEl.getAttribute('data-stage'));
        if (stageId >= 1 && stageId <= 10) {
          state.completedStages[stageId] = !state.completedStages[stageId];
          syncUI(true);
          showToast(
            state.completedStages[stageId]
              ? `Etapa ${stageId} marcada como concluída!`
              : `Etapa ${stageId} reaberta como pendente.`,
            state.completedStages[stageId] ? 'success' : 'info'
          );
        }
        break;
      }

      case 'toggle-all-war-cuts': {
        const enable = actionEl.getAttribute('data-enable') === 'true';
        state.finances.expenses.forEach((exp) => {
          exp.useWarTarget = enable;
        });
        syncUI(true);
        showToast(enable ? 'Cortes de guerra ativados no orçamento.' : 'Exibindo custos originais sem cortes.', 'info');
        break;
      }

      case 'add-expense': {
        const nameInput = document.getElementById('newExpName');
        const valInput = document.getElementById('newExpValue');
        const cycleSelect = document.getElementById('newExpCycle');

        const name = nameInput ? nameInput.value.trim() : '';
        const val = clampNumber(valInput ? valInput.value : 0, 0, 500000, 0);
        const cycle = cycleSelect && ['Dia 01', 'Dia 15', 'Mensal'].includes(cycleSelect.value) ? cycleSelect.value : 'Mensal';

        if (!name || val <= 0) {
          showToast('Informe um nome válido e um valor maior que R$ 0.', 'warn');
          return;
        }

        state.finances.expenses.push({
          id: `exp_${Date.now()}`,
          name: name.slice(0, 80),
          current: val,
          warTarget: val,
          cycle,
          useWarTarget: false,
          fixed: false
        });

        syncUI(true);
        showToast(`Despesa "${name}" adicionada ao fluxo.`, 'success');
        break;
      }

      case 'remove-expense': {
        const idx = Number(actionEl.getAttribute('data-index'));
        const targetExp = state.finances.expenses[idx];
        if (!targetExp || targetExp.fixed) return;

        openModal({
          title: 'Remover Despesa',
          description: `Deseja realmente excluir a despesa "${targetExp.name}" (${Store.formatBRL(targetExp.current)}) da matriz financeira?`,
          confirmLabel: 'Excluir Despesa',
          confirmClass: 'btn--danger',
          onConfirm: () => {
            state.finances.expenses.splice(idx, 1);
            closeModal();
            syncUI(true);
            showToast('Despesa removida.', 'info');
          }
        });
        break;
      }

      case 'set-schedule-tab': {
        const tab = actionEl.getAttribute('data-tab');
        if (['seg_qui', 'sexta', 'sabado'].includes(tab)) {
          state.schedule.activeTab = tab;
          syncUI(true);
        }
        break;
      }

      case 'increment-streak':
        state.schedule.streakDays = clampNumber((Number(state.schedule.streakDays) || 0) + 1, 0, 3650, 1);
        syncUI(true);
        showToast(`Consistência atualizada: ${state.schedule.streakDays} dias seguidos!`, 'success');
        break;

      case 'reset-streak':
        state.schedule.streakDays = 0;
        syncUI(true);
        showToast('Contador de sequência zerado.', 'info');
        break;

      case 'reset-daily-habits':
        state.schedule.dailyHabits.forEach((h) => {
          h.done = false;
        });
        syncUI(true);
        showToast('Checklist diário reiniciado para um novo dia.', 'info');
        break;

      case 'select-main-offer': {
        const offerId = Number(actionEl.getAttribute('data-offer-id'));
        const catalogOffer = Catalog.OFFERS_CATALOG[offerId];
        if (!catalogOffer) return;

        state.offers.selectedOfferId = offerId;
        state.offers.calcSetupPrice = catalogOffer.defaultSetup;
        state.offers.calcMonthlyFee = catalogOffer.defaultMonthly;
        state.sales.scriptOfferId = offerId;
        state.promptGen.offerId = offerId;
        state.blueprint.offerId = offerId;

        syncUI(true);
        showToast(`Oferta #0${offerId} (${catalogOffer.shortName}) definida como foco principal.`, 'success');
        break;
      }

      case 'set-sales-subtab': {
        const subTab = actionEl.getAttribute('data-subtab');
        if (['crm', 'radar', 'scripts'].includes(subTab)) {
          state.sales.activeSubTab = subTab;
          syncUI(true);
        }
        break;
      }

      case 'add-lead': {
        const compInput = document.getElementById('newLeadCompany');
        const nicheInput = document.getElementById('newLeadNiche');
        const offerSelect = document.getElementById('newLeadOffer');
        const valInput = document.getElementById('newLeadValue');

        const company = compInput ? compInput.value.trim() : '';
        const niche = nicheInput && nicheInput.value.trim() ? nicheInput.value.trim() : 'Empresa Local';
        const offerId = offerSelect && [1, 2, 3].includes(Number(offerSelect.value)) ? Number(offerSelect.value) : 1;
        const setupValue = clampNumber(valInput ? valInput.value : 1100, 0, 100000, 1100);

        if (!company) {
          showToast('Informe o nome da empresa para cadastrar no CRM.', 'warn');
          return;
        }

        state.sales.leads.unshift({
          id: `lead_${Date.now()}`,
          company: company.slice(0, 90),
          niche: niche.slice(0, 70),
          offerId,
          setupValue,
          status: 'Prospecção',
          notes: ''
        });

        const key = normalizeEntityKey(company);
        if (key && !state.sales.radar.seenKeys.includes(key)) {
          state.sales.radar.seenKeys.push(key);
        }

        syncUI(true);
        showToast(`Lead "${company}" adicionado ao funil comercial.`, 'success');
        break;
      }

      case 'remove-lead': {
        const idx = Number(actionEl.getAttribute('data-index'));
        const lead = state.sales.leads[idx];
        if (!lead) return;

        openModal({
          title: 'Excluir Lead do Funil',
          description: `Confirmar a exclusão de "${lead.company}" (${lead.status}) do seu Mini-CRM?`,
          confirmLabel: 'Excluir Lead',
          confirmClass: 'btn--danger',
          onConfirm: () => {
            state.sales.leads.splice(idx, 1);
            closeModal();
            syncUI(true);
            showToast('Lead removido do funil.', 'info');
          }
        });
        break;
      }

      case 'load-lead-into-script': {
        const idx = Number(actionEl.getAttribute('data-index'));
        const lead = state.sales.leads[idx];
        if (!lead) return;

        state.sales.scriptCompanyName = lead.company;
        state.sales.scriptNiche = lead.niche;
        state.sales.scriptOfferId = Number(lead.offerId) || 1;
        state.sales.activeSubTab = 'scripts';

        syncUI(true);
        showToast(`Scripts configurados para "${lead.company}".`, 'info');
        break;
      }

      case 'search-radar-buyers':
        searchRealBuyersByRadius();
        break;

      case 'import-radar-buyer': {
        const idx = Number(actionEl.getAttribute('data-index'));
        const item = state.sales.radar.results[idx];
        if (!item) return;

        const offerId = Number(item.offerId) || 1;
        const setupPrice = Store.getDynamicOfferPrice(offerId);

        state.sales.leads.unshift({
          id: `radar_${Date.now()}`,
          company: item.name,
          niche: item.nicheLabel || 'Empresa Local',
          offerId,
          setupValue: setupPrice,
          status: 'Prospecção',
          notes: [item.address, item.phone].filter(Boolean).join(' • ')
        });

        const key = normalizeEntityKey(item.name);
        if (key && !state.sales.radar.seenKeys.includes(key)) {
          state.sales.radar.seenKeys.push(key);
        }

        state.sales.scriptCompanyName = item.name;
        state.sales.scriptNiche = item.nicheLabel || 'Empresa Local';
        state.sales.scriptCity = item.city || 'Joinville';
        state.sales.scriptOfferId = offerId;
        state.sales.radar.results.splice(idx, 1);
        state.sales.activeSubTab = 'scripts';

        syncUI(true);
        showToast(`"${item.name}" importada para o CRM e carregada no Gerador de Scripts!`, 'success');
        break;
      }

      case 'discard-radar-buyer': {
        const idx = Number(actionEl.getAttribute('data-index'));
        const item = state.sales.radar.results[idx];
        if (!item) return;

        const key = normalizeEntityKey(item.name);
        if (key && !state.sales.radar.seenKeys.includes(key)) {
          state.sales.radar.seenKeys.push(key);
        }
        state.sales.radar.results.splice(idx, 1);
        syncUI(true);
        break;
      }

      case 'clear-radar-seen':
        state.sales.radar.seenKeys = [];
        syncUI(true);
        showToast('Histórico de empresas ocultas do Radar limpo.', 'info');
        break;

      case 'copy-element-text': {
        const targetId = actionEl.getAttribute('data-target');
        const targetEl = targetId ? document.getElementById(targetId) : null;
        if (!targetEl) return;

        navigator.clipboard
          .writeText(targetEl.textContent || '')
          .then(() => showToast('Copiado para a área de transferência!', 'success'))
          .catch(() => showToast('Não foi possível copiar automaticamente. Selecione o texto manualmente.', 'warn'));
        break;
      }

      case 'set-blueprint-offer': {
        const offerId = Number(actionEl.getAttribute('data-offer-id'));
        if ([1, 2, 3].includes(offerId)) {
          state.blueprint.offerId = offerId;
          syncUI(true);
        }
        break;
      }

      case 'set-blueprint-lang': {
        const lang = actionEl.getAttribute('data-lang');
        if (lang === 'pt' || lang === 'en') {
          state.blueprint.readmeLang = lang;
          syncUI(true);
        }
        break;
      }

      case 'reset-delivery-checklist':
        state.deliveryChecklist.steps.forEach((s) => {
          s.done = false;
        });
        syncUI(true);
        showToast('Checklist de entrega reiniciado para novo projeto.', 'info');
        break;

      case 'set-timer-duration': {
        const mins = Number(actionEl.getAttribute('data-minutes')) === 30 ? 30 : 15;
        stopStandupTimer();
        state.english.timerDurationMinutes = mins;
        standupTimer.remainingSeconds = mins * 60;
        syncUI(true);
        break;
      }

      case 'toggle-timer':
        toggleStandupTimer();
        break;

      case 'reset-timer':
        stopStandupTimer();
        standupTimer.remainingSeconds = (Number(state.english.timerDurationMinutes) || 15) * 60;
        renderActiveStage();
        break;

      case 'complete-english-session':
        state.english.completedSessions = (Number(state.english.completedSessions) || 0) + 1;
        syncUI(true);
        showToast('Sessão de inglês contabilizada! Continue consistente.', 'success');
        break;

      case 'standup-prev-q': {
        const total = Catalog.STANDUP_QUESTIONS.length;
        state.english.currentQuestionIndex = (state.english.currentQuestionIndex - 1 + total) % total;
        syncUI(true);
        break;
      }

      case 'standup-next-q': {
        const total = Catalog.STANDUP_QUESTIONS.length;
        state.english.currentQuestionIndex = (state.english.currentQuestionIndex + 1) % total;
        syncUI(true);
        break;
      }

      case 'standup-random-q': {
        const total = Catalog.STANDUP_QUESTIONS.length;
        let nextIdx = Math.floor(Math.random() * total);
        if (nextIdx === state.english.currentQuestionIndex && total > 1) {
          nextIdx = (nextIdx + 1) % total;
        }
        state.english.currentQuestionIndex = nextIdx;
        syncUI(true);
        break;
      }

      default:
        break;
    }
  }

  function handleChangeAction(targetEl) {
    const action = targetEl.getAttribute('data-action');
    const state = Store.getState();

    switch (action) {
      case 'update-finance-field': {
        const field = targetEl.getAttribute('data-field');
        if (['incomeDay15', 'incomeDay01', 'incomeVA', 'extraFreelaManual'].includes(field)) {
          state.finances[field] = clampNumber(targetEl.value, 0, 1000000, 0);
          syncUI(true);
        }
        break;
      }

      case 'update-offer-calc': {
        const field = targetEl.getAttribute('data-field');
        if (['calcSetupPrice', 'calcMonthlyFee', 'calcTargetIncome'].includes(field)) {
          state.offers[field] = clampNumber(targetEl.value, 0, 100000, 0);
          syncUI(true);
        }
        break;
      }

      case 'toggle-crm-sync':
        state.finances.syncFreelaWithCRM = Boolean(targetEl.checked);
        syncUI(true);
        break;

      case 'update-expense-cycle': {
        const idx = Number(targetEl.getAttribute('data-index'));
        const exp = state.finances.expenses[idx];
        if (exp && ['Dia 01', 'Dia 15', 'Mensal'].includes(targetEl.value)) {
          exp.cycle = targetEl.value;
          syncUI(true);
        }
        break;
      }

      case 'update-expense-field': {
        const idx = Number(targetEl.getAttribute('data-index'));
        const field = targetEl.getAttribute('data-field');
        const exp = state.finances.expenses[idx];
        if (exp && (field === 'current' || field === 'warTarget')) {
          exp[field] = clampNumber(targetEl.value, 0, 500000, 0);
          syncUI(true);
        }
        break;
      }

      case 'toggle-expense-war-mode': {
        const idx = Number(targetEl.getAttribute('data-index'));
        const exp = state.finances.expenses[idx];
        if (exp) {
          exp.useWarTarget = Boolean(targetEl.checked);
          syncUI(true);
        }
        break;
      }

      case 'toggle-habit': {
        const idx = Number(targetEl.getAttribute('data-index'));
        const habit = state.schedule.dailyHabits[idx];
        if (habit) {
          habit.done = Boolean(targetEl.checked);
          syncUI(true);
        }
        break;
      }

      case 'update-lead-field': {
        const idx = Number(targetEl.getAttribute('data-index'));
        const field = targetEl.getAttribute('data-field');
        const lead = state.sales.leads[idx];
        if (!lead) return;

        if (field === 'offerId') {
          lead.offerId = [1, 2, 3].includes(Number(targetEl.value)) ? Number(targetEl.value) : 1;
        } else if (field === 'setupValue') {
          lead.setupValue = clampNumber(targetEl.value, 0, 100000, 1100);
        } else if (field === 'status') {
          lead.status = targetEl.value;
          if (lead.status === 'Fechado 50% Pix' || lead.status === 'Entregue 100%') {
            showToast(`Caixa atualizado com o avanço de "${lead.company}"!`, 'success');
          }
        }
        syncUI(true);
        break;
      }

      case 'update-radar-config': {
        const field = targetEl.getAttribute('data-field');
        if (field === 'nicheKey' && Catalog.RADAR_NICHES[targetEl.value]) {
          state.sales.radar.nicheKey = targetEl.value;
          syncUI(true);
        } else if (field === 'ringIndex') {
          state.sales.radar.ringIndex = clampNumber(targetEl.value, 0, 3, 0);
          syncUI(true);
        }
        break;
      }

      case 'update-sales-script-offer':
        state.sales.scriptOfferId = [1, 2, 3].includes(Number(targetEl.value)) ? Number(targetEl.value) : 1;
        Store.saveState();
        Views.updateSalesScriptsDOM();
        break;

      case 'update-prompt-config': {
        const field = targetEl.getAttribute('data-field');
        if (field === 'offerId') {
          state.promptGen.offerId = [1, 2, 3].includes(Number(targetEl.value)) ? Number(targetEl.value) : 1;
        } else if (field === 'moduleType') {
          state.promptGen.moduleType = targetEl.value;
        }
        syncUI(true);
        break;
      }

      case 'toggle-delivery-step': {
        const idx = Number(targetEl.getAttribute('data-index'));
        const step = state.deliveryChecklist.steps[idx];
        if (step) {
          step.done = Boolean(targetEl.checked);
          syncUI(true);
        }
        break;
      }

      case 'update-loan-field': {
        const field = targetEl.getAttribute('data-field');
        if (field === 'emergencyReserve') {
          state.loan.emergencyReserve = clampNumber(targetEl.value, 0, 1000000, 0);
        } else if (field === 'amortizationDiscountPercent') {
          state.loan.amortizationDiscountPercent = clampNumber(targetEl.value, 0, 50, 8);
        }
        syncUI(true);
        break;
      }

      case 'update-installment-status': {
        const idx = Number(targetEl.getAttribute('data-index'));
        const inst = state.loan.installments[idx];
        if (inst && ['pending', 'paid_normal', 'amortized'].includes(targetEl.value)) {
          inst.status = targetEl.value;
          syncUI(true);
        }
        break;
      }

      case 'toggle-career-check': {
        const idx = Number(targetEl.getAttribute('data-index'));
        const item = state.career.readinessChecks[idx];
        if (item) {
          item.done = Boolean(targetEl.checked);
          syncUI(true);
        }
        break;
      }

      case 'update-career-url': {
        const field = targetEl.getAttribute('data-field');
        if (field === 'githubProject1Url' || field === 'githubProject2Url') {
          state.career[field] = targetEl.value.trim();
          syncUI(true);
        }
        break;
      }

      default:
        break;
    }
  }

  function handleInputAction(targetEl) {
    const action = targetEl.getAttribute('data-action');
    const state = Store.getState();

    switch (action) {
      case 'update-offer-calc': {
        const field = targetEl.getAttribute('data-field');
        if (['calcSetupPrice', 'calcMonthlyFee', 'calcTargetIncome'].includes(field)) {
          state.offers[field] = clampNumber(targetEl.value, 0, 100000, 0);
          Store.saveState();
          updateHeaderMetrics();
        }
        break;
      }

      case 'update-sales-script-text': {
        const field = targetEl.getAttribute('data-field');
        if (['scriptCompanyName', 'scriptContactName', 'scriptCity', 'scriptNiche'].includes(field)) {
          state.sales[field] = targetEl.value.slice(0, 80);
          Store.saveState();
          Views.updateSalesScriptsDOM();
        }
        break;
      }

      case 'update-serper-key':
        Store.setSerperApiKey(targetEl.value);
        break;

      case 'update-prompt-context':
        state.promptGen.clientContext = targetEl.value.slice(0, 1200);
        Store.saveState();
        Views.updatePromptOutputDOM();
        break;

      case 'update-delivery-client':
        state.deliveryChecklist.clientName = targetEl.value.slice(0, 90);
        Store.saveState();
        break;

      case 'update-english-notes':
        state.english.practiceNotes = targetEl.value.slice(0, 2000);
        Store.saveState();
        break;

      default:
        break;
    }
  }

  function bindGlobalListeners() {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeModal();
        toggleMobileSidebar(false);
        return;
      }
      if (
        event.target &&
        event.target.tagName === 'INPUT' &&
        event.target.type === 'number' &&
        ['e', 'E', '+', '-'].includes(event.key)
      ) {
        event.preventDefault();
      }
    });

    document.addEventListener(
      'wheel',
      (event) => {
        if (
          document.activeElement === event.target &&
          event.target &&
          event.target.tagName === 'INPUT' &&
          event.target.type === 'number'
        ) {
          event.target.blur();
        }
      },
      { passive: true }
    );

    document.addEventListener('click', (event) => {
      const actionEl = event.target.closest('[data-action]');
      if (!actionEl) return;

      const tag = actionEl.tagName.toLowerCase();
      if ((tag === 'input' && actionEl.type !== 'button') || tag === 'select' || tag === 'textarea') {
        return;
      }
      handleClickAction(actionEl);
    });

    document.addEventListener('change', (event) => {
      const targetEl = event.target.closest('[data-action]');
      if (targetEl) {
        handleChangeAction(targetEl);
      }
    });

    document.addEventListener('input', (event) => {
      const targetEl = event.target.closest('[data-action]');
      if (targetEl) {
        handleInputAction(targetEl);
      }
    });

    const fileInput = document.getElementById('importFileInput');
    if (fileInput) {
      fileInput.addEventListener('change', (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const content = String(loadEvent.target?.result || '');
          const result = Store.importFromRawJSON(content);
          if (!result.ok) {
            showToast(result.error, 'danger');
          } else {
            closeModal();
            syncUI(true);
            showToast('Arquivo JSON validado e importado com sucesso!', 'success');
          }
          fileInput.value = '';
        };
        reader.readAsText(file);
      });
    }
  }

  function bootstrap() {
    const savedTheme = Store.loadTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);

    const state = Store.getState();
    standupTimer.remainingSeconds = (Number(state.english.timerDurationMinutes) || 15) * 60;

    bindGlobalListeners();
    syncUI(true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

  let deferredInstallPrompt = null;

  global.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;

    const actionsContainer = document.querySelector('.header-actions');
    if (!actionsContainer || document.getElementById('pwaInstallBtn')) return;

    const installBtn = document.createElement('button');
    installBtn.type = 'button';
    installBtn.id = 'pwaInstallBtn';
    installBtn.className = 'btn btn--primary btn--sm';
    installBtn.title = 'Instalar Aplicativo Nativo';
    installBtn.innerHTML = `
      <svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3v12" />
        <polyline points="7 10 12 15 17 10" />
        <path d="M5 21h14" />
      </svg>
      <span>Instalar App</span>
    `;

    installBtn.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        installBtn.remove();
      }
      deferredInstallPrompt = null;
    });

    actionsContainer.prepend(installBtn);
  });

  global.addEventListener('appinstalled', () => {
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) installBtn.remove();
    deferredInstallPrompt = null;
    showToast('WAR ROOM 90D instalado como aplicativo nativo!', 'success');
  });

  if ('serviceWorker' in navigator) {
    global.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.error('Falha ao registrar Service Worker:', err));
    });
  }
})(window);
