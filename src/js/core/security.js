// filepath: src/js/core/security.js
(function initSecurityModule(global) {
  'use strict';

  const WarRoom = (global.WarRoom = global.WarRoom || {});

  const HTML_ESCAPE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  /**
   * Sanitiza strings dinâmicas antes de interpolação no DOM para mitigar DOM XSS.
   * @param {unknown} value
   * @returns {string}
   */
  function escapeHTML(value) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char]);
  }

  /**
   * Valida URLs externas permitindo apenas protocolos HTTP/HTTPS seguros.
   * @param {unknown} rawUrl
   * @returns {string}
   */
  function sanitizeUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    const trimmed = rawUrl.trim();
    if (!trimmed) return '';

    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      const parsed = new URL(withProtocol);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.href;
      }
      return '';
    } catch {
      return '';
    }
  }

  /**
   * Converte entradas numéricas com limites mínimo e máximo seguros.
   * @param {unknown} value
   * @param {number} min
   * @param {number} max
   * @param {number} fallback
   * @returns {number}
   */
  function clampNumber(value, min = -Infinity, max = Infinity, fallback = 0) {
    const parsed = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
  }

  /**
   * Normaliza nomes de empresas para comparação e deduplicação estrita.
   * @param {unknown} name
   * @returns {string}
   */
  function normalizeEntityKey(name) {
    return String(name || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  function setSessionSecret(key, value) {
    try {
      if (!value || !String(value).trim()) {
        sessionStorage.removeItem(key);
        return;
      }
      sessionStorage.setItem(key, String(value).trim());
    } catch {
      // Ignora bloqueio de storage em modo restrito
    }
  }

  function getSessionSecret(key) {
    try {
      return sessionStorage.getItem(key) || '';
    } catch {
      return '';
    }
  }

  /**
   * Valida e higieniza um objeto de backup JSON antes de mesclar ao estado.
   * @param {unknown} candidate
   * @param {object} defaultState
   * @returns {{ isValid: boolean, sanitizedState: object | null, error: string | null }}
   */
  function validateAndSanitizeBackup(candidate, defaultState) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
      return { isValid: false, sanitizedState: null, error: 'O arquivo não contém um objeto JSON válido.' };
    }

    try {
      const clean = structuredClone
        ? structuredClone(defaultState)
        : JSON.parse(JSON.stringify(defaultState));

      clean.currentStage = clampNumber(candidate.currentStage, 0, 10, 0);

      if (candidate.completedStages && typeof candidate.completedStages === 'object') {
        for (let i = 1; i <= 10; i++) {
          clean.completedStages[i] = Boolean(candidate.completedStages[i]);
        }
      }

      if (candidate.finances && typeof candidate.finances === 'object') {
        const cf = candidate.finances;
        clean.finances.incomeDay15 = clampNumber(cf.incomeDay15, 0, 1000000, clean.finances.incomeDay15);
        clean.finances.incomeDay01 = clampNumber(cf.incomeDay01, 0, 1000000, clean.finances.incomeDay01);
        clean.finances.incomeVA = clampNumber(cf.incomeVA, 0, 1000000, clean.finances.incomeVA);
        clean.finances.extraFreelaManual = clampNumber(cf.extraFreelaManual, 0, 1000000, 0);
        clean.finances.syncFreelaWithCRM = Boolean(cf.syncFreelaWithCRM ?? true);

        if (Array.isArray(cf.expenses) && cf.expenses.length > 0) {
          clean.finances.expenses = cf.expenses
            .filter((item) => item && typeof item === 'object' && String(item.name || '').trim())
            .slice(0, 60)
            .map((item, idx) => ({
              id: String(item.id || `exp_${idx}`).slice(0, 40),
              name: String(item.name).trim().slice(0, 80),
              current: clampNumber(item.current, 0, 500000, 0),
              warTarget: clampNumber(item.warTarget, 0, 500000, 0),
              cycle: ['Dia 01', 'Dia 15', 'Mensal'].includes(item.cycle) ? item.cycle : 'Mensal',
              useWarTarget: Boolean(item.useWarTarget),
              fixed: Boolean(item.fixed)
            }));
        }
      }

      if (candidate.schedule && typeof candidate.schedule === 'object') {
        const cs = candidate.schedule;
        clean.schedule.activeTab = ['seg_qui', 'sexta', 'sabado'].includes(cs.activeTab) ? cs.activeTab : 'seg_qui';
        clean.schedule.streakDays = clampNumber(cs.streakDays, 0, 3650, 1);
        if (Array.isArray(cs.dailyHabits) && cs.dailyHabits.length === clean.schedule.dailyHabits.length) {
          clean.schedule.dailyHabits = clean.schedule.dailyHabits.map((defHabit, idx) => ({
            ...defHabit,
            done: Boolean(cs.dailyHabits[idx]?.done)
          }));
        }
      }

      if (candidate.offers && typeof candidate.offers === 'object') {
        const co = candidate.offers;
        clean.offers.selectedOfferId = [1, 2, 3].includes(Number(co.selectedOfferId)) ? Number(co.selectedOfferId) : 1;
        clean.offers.calcSetupPrice = clampNumber(co.calcSetupPrice, 100, 50000, 1100);
        clean.offers.calcMonthlyFee = clampNumber(co.calcMonthlyFee, 0, 10000, 200);
        clean.offers.calcTargetIncome = clampNumber(co.calcTargetIncome, 500, 100000, 2000);
      }

      if (candidate.sales && typeof candidate.sales === 'object') {
        const csa = candidate.sales;
        clean.sales.activeSubTab = ['crm', 'radar', 'scripts'].includes(csa.activeSubTab) ? csa.activeSubTab : 'crm';
        clean.sales.scriptOfferId = [1, 2, 3].includes(Number(csa.scriptOfferId)) ? Number(csa.scriptOfferId) : 1;
        clean.sales.scriptNiche = String(csa.scriptNiche || clean.sales.scriptNiche).slice(0, 80);
        clean.sales.scriptCompanyName = String(csa.scriptCompanyName || clean.sales.scriptCompanyName).slice(0, 80);
        clean.sales.scriptContactName = String(csa.scriptContactName || clean.sales.scriptContactName).slice(0, 60);
        clean.sales.scriptCity = String(csa.scriptCity || clean.sales.scriptCity).slice(0, 60);

        if (Array.isArray(csa.leads)) {
          const validStatuses = ['Prospecção', 'Respondeu', 'Reunião', 'Fechado 50% Pix', 'Entregue 100%'];
          clean.sales.leads = csa.leads
            .filter((l) => l && typeof l === 'object' && String(l.company || '').trim())
            .slice(0, 200)
            .map((l, idx) => ({
              id: String(l.id || `lead_${idx}`).slice(0, 40),
              company: String(l.company).trim().slice(0, 90),
              niche: String(l.niche || 'Empresa B2B').trim().slice(0, 70),
              offerId: [1, 2, 3].includes(Number(l.offerId)) ? Number(l.offerId) : 1,
              setupValue: clampNumber(l.setupValue, 0, 100000, 1100),
              status: validStatuses.includes(l.status) ? l.status : 'Prospecção',
              notes: String(l.notes || '').slice(0, 160)
            }));
        }

        if (csa.radar && typeof csa.radar === 'object') {
          clean.sales.radar.nicheKey = ['dentist', 'beauty', 'realestate', 'lawyer', 'solar'].includes(csa.radar.nicheKey)
            ? csa.radar.nicheKey
            : 'dentist';
          clean.sales.radar.ringIndex = clampNumber(csa.radar.ringIndex, 0, 3, 0);
          clean.sales.radar.seenKeys = Array.isArray(csa.radar.seenKeys)
            ? csa.radar.seenKeys.map((k) => normalizeEntityKey(k)).filter(Boolean).slice(0, 1000)
            : [];
        }
      }

      if (candidate.promptGen && typeof candidate.promptGen === 'object') {
        const cp = candidate.promptGen;
        clean.promptGen.offerId = [1, 2, 3].includes(Number(cp.offerId)) ? Number(cp.offerId) : 1;
        clean.promptGen.moduleType = ['arch', 'backend', 'llm', 'frontend', 'security', 'refactor'].includes(cp.moduleType)
          ? cp.moduleType
          : 'arch';
        clean.promptGen.clientContext = String(cp.clientContext || clean.promptGen.clientContext).slice(0, 1200);
      }

      if (candidate.blueprint && typeof candidate.blueprint === 'object') {
        clean.blueprint.offerId = [1, 2, 3].includes(Number(candidate.blueprint.offerId))
          ? Number(candidate.blueprint.offerId)
          : 1;
        clean.blueprint.readmeLang = candidate.blueprint.readmeLang === 'en' ? 'en' : 'pt';
      }

      if (candidate.deliveryChecklist && typeof candidate.deliveryChecklist === 'object') {
        const cd = candidate.deliveryChecklist;
        clean.deliveryChecklist.clientName = String(cd.clientName || clean.deliveryChecklist.clientName).slice(0, 90);
        if (Array.isArray(cd.steps) && cd.steps.length === clean.deliveryChecklist.steps.length) {
          clean.deliveryChecklist.steps = clean.deliveryChecklist.steps.map((defStep, idx) => ({
            ...defStep,
            done: Boolean(cd.steps[idx]?.done)
          }));
        }
      }

      if (candidate.english && typeof candidate.english === 'object') {
        const ce = candidate.english;
        clean.english.timerDurationMinutes = ce.timerDurationMinutes === 30 ? 30 : 15;
        clean.english.currentQuestionIndex = clampNumber(ce.currentQuestionIndex, 0, 4, 0);
        clean.english.practiceNotes = String(ce.practiceNotes ?? clean.english.practiceNotes).slice(0, 2000);
        clean.english.completedSessions = clampNumber(ce.completedSessions, 0, 10000, 0);
      }

      if (candidate.loan && typeof candidate.loan === 'object') {
        const cl = candidate.loan;
        clean.loan.emergencyReserve = clampNumber(cl.emergencyReserve, 0, 1000000, 0);
        clean.loan.amortizationDiscountPercent = clampNumber(cl.amortizationDiscountPercent, 0, 50, 8);
        if (Array.isArray(cl.installments) && cl.installments.length === 10) {
          const validInstStatuses = ['pending', 'paid_normal', 'amortized'];
          clean.loan.installments = clean.loan.installments.map((defInst, idx) => ({
            ...defInst,
            status: validInstStatuses.includes(cl.installments[idx]?.status)
              ? cl.installments[idx].status
              : 'pending'
          }));
        }
      }

      if (candidate.career && typeof candidate.career === 'object') {
        const cc = candidate.career;
        clean.career.githubProject1Url = sanitizeUrl(cc.githubProject1Url);
        clean.career.githubProject2Url = sanitizeUrl(cc.githubProject2Url);
        if (Array.isArray(cc.readinessChecks) && cc.readinessChecks.length === clean.career.readinessChecks.length) {
          clean.career.readinessChecks = clean.career.readinessChecks.map((defCheck, idx) => ({
            ...defCheck,
            done: Boolean(cc.readinessChecks[idx]?.done)
          }));
        }
      }

      return { isValid: true, sanitizedState: clean, error: null };
    } catch {
      return { isValid: false, sanitizedState: null, error: 'Falha ao processar a estrutura do arquivo JSON.' };
    }
  }

  const ICON_PATHS = {
    gauge: '<path d="M12 14l4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
    gitBranch: '<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>',
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
    landmark: '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    plus: '<line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    arrowRight: '<line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    arrowLeft: '<line x1="19" x2="5" y1="12" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    externalLink: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/>',
    radar: '<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"/><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"/><path d="M12 18h.01"/><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59 5.66-5.66"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
    shuffle: '<path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><polyline points="18 2 22 6 18 10"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><polyline points="18 14 22 18 18 22"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    close: '<line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>'
  };

  function renderIcon(name, extraClass = '') {
    const body = ICON_PATHS[name] || ICON_PATHS.bolt;
    const cls = extraClass ? `icon ${extraClass}` : 'icon';
    return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
  }

  WarRoom.Security = {
    escapeHTML,
    sanitizeUrl,
    clampNumber,
    normalizeEntityKey,
    setSessionSecret,
    getSessionSecret,
    validateAndSanitizeBackup
  };

  WarRoom.Icons = {
    render: renderIcon
  };
})(window);