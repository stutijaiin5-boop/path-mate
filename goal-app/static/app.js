let currentReportId = null;
let currentCards = [];
let actionData = {};

// DOM refs
const goalInput = document.getElementById('goalInput');
const situationInput = document.getElementById('situationInput');
const generateBtn = document.getElementById('generateBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingMessage = document.getElementById('loadingMessage');
const reportContainer = document.getElementById('reportContainer');
const cardsGrid = document.getElementById('cardsGrid');
const reportGoal = document.getElementById('reportGoal');
const reportIdDisplay = document.getElementById('reportIdDisplay');
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');
const toast = document.getElementById('toast');
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const settingsToggle = document.getElementById('settingsToggle');
const themeToggle = document.getElementById('themeToggle');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileDrawer = document.getElementById('mobileDrawer');

const loadingMessages = [
  'Analyzing your execution gap...',
  'Mapping your current state...',
  'Identifying leverage points...',
  'Building your roadmap...',
  'Calculating success metrics...',
  'Finding your first action...',
];

// ===== NAVIGATION =====
function switchPage(pageId) {
  mobileDrawer.classList.remove('open');

  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === pageId);
  });

  settingsToggle.classList.toggle('active', pageId === 'settings');

  pages.forEach(p => p.classList.toggle('active', p.id === `page-${pageId}`));

  if (pageId === 'analytics') renderAnalytics();
  if (pageId === 'history') {
    renderHistoryPage();
    renderActionHistory();
  }
  if (pageId === 'calendar') renderCalendar();
}

navLinks.forEach(link => {
  link.addEventListener('click', () => switchPage(link.dataset.page));
});

// Settings gear navigates to settings page
settingsToggle.addEventListener('click', () => switchPage('settings'));

// ===== HAMBURGER =====
hamburgerBtn.addEventListener('click', () => {
  mobileDrawer.classList.toggle('open');
});

// ===== GENERATE =====
generateBtn.addEventListener('click', generateReport);
goalInput.addEventListener('keydown', e => { if (e.key === 'Enter' && e.metaKey) generateReport(); });
situationInput.addEventListener('keydown', e => { if (e.key === 'Enter' && e.metaKey) generateReport(); });

async function generateReport() {
  const goal = goalInput.value.trim();
  const situation = situationInput.value.trim();

  if (!goal || !situation) {
    showToast('Please enter both your goal and current situation.');
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating...';

  let msgIndex = 0;
  const msgInterval = setInterval(() => {
    msgIndex = (msgIndex + 1) % loadingMessages.length;
    loadingMessage.textContent = loadingMessages[msgIndex];
  }, 2000);
  loadingMessage.textContent = loadingMessages[0];
  loadingOverlay.classList.add('visible');

  try {
    const res = await fetch('/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, current_situation: situation }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Generation failed');
    }

    const data = await res.json();
    currentReportId = data.id;
    currentCards = data.cards;

    renderReport(data);
    await loadActionsForReport(data.id);
    if (document.getElementById('page-history').classList.contains('active')) {
      renderHistoryPage();
      renderActionHistory();
    }
    switchPage('home');
  } catch (err) {
    showToast('Error: ' + err.message);
  } finally {
    clearInterval(msgInterval);
    loadingOverlay.classList.remove('visible');
    generateBtn.disabled = false;
    generateBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
      Generate Execution Plan
    `;
  }
}

// ===== REPORT VIEW TOGGLE =====
let reportView = localStorage.getItem('reportView') || 'full';

function applyReportView() {
  const briefBtn = document.getElementById('viewBriefBtn');
  const fullBtn = document.getElementById('viewFullBtn');
  if (briefBtn) briefBtn.classList.toggle('active', reportView === 'brief');
  if (fullBtn) fullBtn.classList.toggle('active', reportView === 'full');
  document.querySelectorAll('.card-content').forEach(el => {
    el.classList.toggle('collapsed', reportView === 'brief');
  });
  document.querySelectorAll('.card-expand-btn').forEach(el => {
    el.classList.toggle('visible', reportView === 'brief');
  });
}

document.getElementById('viewBriefBtn')?.addEventListener('click', () => {
  reportView = 'brief';
  localStorage.setItem('reportView', 'brief');
  applyReportView();
});

document.getElementById('viewFullBtn')?.addEventListener('click', () => {
  reportView = 'full';
  localStorage.setItem('reportView', 'full');
  applyReportView();
});

// ===== RENDER REPORT =====
function renderReport(data) {
  reportGoal.textContent = data.goal;
  reportIdDisplay.textContent = `#${data.id}`;
  cardsGrid.innerHTML = '';

  data.cards.forEach((cardData, index) => {
    const card = document.createElement('div');
    card.className = `glass-card ${cardData.extra_class || ''}`;

    const badgeHtml = cardData.badge
      ? `<span class="priority-badge ${cardData.priority}">${cardData.badge}</span>`
      : '';

    card.innerHTML = `
      <div class="card-header">
        <div class="card-icon">${cardData.icon}</div>
        <div class="card-title-group">
          <div class="card-title">${cardData.title}</div>
          ${badgeHtml}
        </div>
      </div>
      <div class="card-content${reportView === 'brief' ? ' collapsed' : ''}">${cardData.content}</div>
      <button class="card-expand-btn${reportView === 'brief' ? ' visible' : ''}">
        ${reportView === 'brief' ? '▼ Expand' : ''}
      </button>
    `;

    cardsGrid.appendChild(card);

    // Expand/collapse toggle
    const expandBtn = card.querySelector('.card-expand-btn');
    const content = card.querySelector('.card-content');
    if (expandBtn) {
      expandBtn.addEventListener('click', () => {
        const isCollapsed = content.classList.toggle('collapsed');
        expandBtn.textContent = isCollapsed ? '▼ Expand' : '▲ Collapse';
      });
    }
  });

  reportContainer.classList.add('visible');
  reportContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Bind action checkboxes
  document.querySelectorAll('.action-cb').forEach(cb => {
    cb.addEventListener('change', handleActionCheck);
  });

  burstSparkles();

  setTimeout(() => {
    document.querySelectorAll('.risk-bar-fill').forEach(bar => {
      const w = bar.style.width;
      bar.style.width = '0%';
      setTimeout(() => { bar.style.width = w; }, 100);
    });
  }, 300);
}

function burstSparkles() {
  const colors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#22c55e', '#ef4444', '#ec4899'];
  for (let i = 0; i < 24; i++) {
    const sparkle = document.createElement('div');
    sparkle.style.cssText = `
      position: fixed; pointer-events: none; z-index: 9999;
      width: ${Math.random() * 5 + 2}px; height: ${Math.random() * 5 + 2}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 50%;
      left: ${40 + Math.random() * 20}%;
      top: ${40 + Math.random() * 20}%;
      opacity: 1;
      box-shadow: 0 0 6px currentColor;
    `;
    document.body.appendChild(sparkle);
    const angle = Math.random() * Math.PI * 2;
    const velocity = 100 + Math.random() * 180;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity;
    sparkle.animate([
      { transform: 'translate(0,0) scale(0)', opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) scale(1)`, opacity: 0.8, offset: 0.3 },
      { transform: `translate(${dx * 1.3}px, ${dy * 1.3}px) scale(0)`, opacity: 0 },
    ], {
      duration: 700 + Math.random() * 500,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    }).onfinish = () => sparkle.remove();
  }
}

// ===== ACTION CHECKBOXES =====
async function loadActionsForReport(reportId) {
  try {
    const res = await fetch(`/actions/report/${reportId}`);
    const data = await res.json();
    actionData = {};
    data.actions.forEach(a => { actionData[a.id] = a; });
    document.querySelectorAll('.action-cb').forEach(cb => {
      const idx = parseInt(cb.dataset.idx);
      const report = parseInt(cb.dataset.report);
      const actions = Object.values(actionData).filter(a => a.report_id === report);
      const action = actions[idx];
      if (action) {
        cb.dataset.actionId = action.id;
        cb.checked = action.checked;
        if (action.checked) {
          cb.classList.add('checked-item');
          const ts = document.createElement('span');
          ts.className = 'action-checked-at';
          ts.textContent = formatDate(action.checked_at);
          if (cb.nextSibling) {
            cb.parentNode.insertBefore(ts, cb.nextSibling.nextSibling);
          }
        }
      }
    });
  } catch {}
}

async function handleActionCheck(e) {
  const cb = e.target;
  const actionId = parseInt(cb.dataset.actionId);
  if (!actionId) return;
  try {
    const res = await fetch('/actions/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action_id: actionId, checked: cb.checked }),
    });
    if (!res.ok) throw new Error('Toggle failed');
    const updated = await res.json();
    actionData[updated.id] = updated;
    if (updated.checked) {
      cb.classList.add('checked-item');
      const existing = cb.parentNode.querySelector('.action-checked-at');
      if (existing) existing.remove();
      const ts = document.createElement('span');
      ts.className = 'action-checked-at';
      ts.textContent = formatDate(updated.checked_at);
      if (cb.nextSibling) {
        cb.parentNode.insertBefore(ts, cb.nextSibling.nextSibling);
      }
      showToast('Action completed! ✅');
    } else {
      cb.classList.remove('checked-item');
      const ts = cb.parentNode.querySelector('.action-checked-at');
      if (ts) ts.remove();
    }
  } catch {
    cb.checked = !cb.checked;
    showToast('Failed to update action.');
  }
}

// ===== SEARCH (report) =====
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase().trim();
  searchClear.classList.toggle('visible', query.length > 0);
  document.querySelectorAll('.glass-card').forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(query) ? '' : 'none';
  });
});

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchClear.classList.remove('visible');
  document.querySelectorAll('.glass-card').forEach(c => c.style.display = '');
});

// ===== EXPORT =====
document.getElementById('exportBtn').addEventListener('click', async () => {
  if (!currentReportId) return;
  try {
    const res = await fetch(`/export/${currentReportId}`);
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    downloadBlob(blob, `goal-report-${currentReportId}.pdf`);
    showToast('PDF exported!');
  } catch (err) { showToast('Error: ' + err.message); }
});

document.getElementById('exportMdBtn').addEventListener('click', async () => {
  if (!currentReportId) return;
  try {
    const res = await fetch(`/export/markdown/${currentReportId}`);
    if (!res.ok) throw new Error('Export failed');
    const text = await res.text();
    downloadBlob(new Blob([text], { type: 'text/markdown' }), `goal-report-${currentReportId}.md`);
    showToast('Markdown exported!');
  } catch (err) { showToast('Error: ' + err.message); }
});

document.getElementById('exportDocxBtn').addEventListener('click', async () => {
  if (!currentReportId) return;
  try {
    const res = await fetch(`/export/docx/${currentReportId}`);
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    downloadBlob(blob, `goal-report-${currentReportId}.docx`);
    showToast('Word document exported!');
  } catch (err) { showToast('Error: ' + err.message); }
});

document.getElementById('exportZipBtn').addEventListener('click', async () => {
  try {
    const res = await fetch('/export/zip');
    if (!res.ok) throw new Error('Export failed');
    downloadBlob(await res.blob(), 'all-reports.zip');
    showToast('All reports exported as ZIP!');
  } catch (err) { showToast('Error: ' + err.message); }
});

document.getElementById('shareBtn').addEventListener('click', async () => {
  if (!currentReportId) return;
  const url = `${window.location.origin}/?report=${currentReportId}`;
  try {
    await navigator.clipboard.writeText(url);
    showToast('Report link copied to clipboard!');
  } catch { showToast('Link: ' + url); }
});

// ===== THEME =====
themeToggle.addEventListener('click', () => {
  const themes = ['dark', 'light', 'ocean', 'forest', 'sunset'];
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const idx = themes.indexOf(current);
  const next = themes[(idx + 1) % themes.length];
  applyTheme(next);
  showToast(`Theme: ${next.charAt(0).toUpperCase() + next.slice(1)}`);
});

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icons = { dark: '🌙', light: '☀️', ocean: '🌊', forest: '🌿', sunset: '🌅' };
  themeToggle.textContent = icons[theme] || '🌙';
  localStorage.setItem('theme', theme);
  document.querySelectorAll('.theme-option').forEach(o => {
    o.classList.toggle('active', o.dataset.theme === theme);
  });
}

const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

// ===== SETTINGS: Theme Selector =====
document.querySelectorAll('.theme-option').forEach(opt => {
  opt.addEventListener('click', () => applyTheme(opt.dataset.theme));
});

// ===== SETTINGS: Custom Colors =====
const accentPicker = document.getElementById('accentPicker');
const accent2Picker = document.getElementById('accent2Picker');
const resetColorsBtn = document.getElementById('resetColorsBtn');

if (accentPicker) {
  const savedAccent = localStorage.getItem('customAccent');
  const savedAccent2 = localStorage.getItem('customAccent2');
  if (savedAccent) accentPicker.value = savedAccent;
  if (savedAccent2) accent2Picker.value = savedAccent2;

  accentPicker.addEventListener('input', () => {
    document.documentElement.style.setProperty('--accent', accentPicker.value);
    localStorage.setItem('customAccent', accentPicker.value);
  });
  accent2Picker.addEventListener('input', () => {
    document.documentElement.style.setProperty('--accent2', accent2Picker.value);
    localStorage.setItem('customAccent2', accent2Picker.value);
  });
  if (resetColorsBtn) {
    resetColorsBtn.addEventListener('click', () => {
      localStorage.removeItem('customAccent');
      localStorage.removeItem('customAccent2');
      document.documentElement.style.removeProperty('--accent');
      document.documentElement.style.removeProperty('--accent2');
      const theme = document.documentElement.getAttribute('data-theme') || 'dark';
      applyTheme(theme);
      const defaults = { dark: '#8b5cf6,#06b6d4', light: '#7c3aed,#0891b2', ocean: '#3b82f6,#06b6d4', forest: '#22c55e,#10b981', sunset: '#f97316,#eab308' };
      const [a1, a2] = (defaults[theme] || defaults.dark).split(',');
      accentPicker.value = a1;
      accent2Picker.value = a2;
      showToast('Colors reset to theme defaults');
    });
  }
}

// ===== SETTINGS: Email Reminder =====
document.getElementById('sendReminderBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('reminderEmail').value.trim();
  if (!email || !currentReportId) {
    showToast(!email ? 'Enter an email address' : 'Generate a report first');
    return;
  }
  try {
    const res = await fetch('/reminders/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_id: currentReportId, to_email: email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed');
    }
    showToast('Reminder sent! Check your inbox.');
  } catch (err) {
    showToast('Error: ' + err.message);
  }
});

// ===== SETTINGS: Import JSON =====
document.getElementById('importBtn')?.addEventListener('click', () => {
  document.getElementById('importFileInput').click();
});

document.getElementById('importFileInput')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    const res = await fetch('/import/json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Import failed');
    const result = await res.json();
    currentReportId = result.id;
    currentCards = result.cards;
    renderReport(result);
    showToast('Report imported successfully!');
    switchPage('home');
  } catch (err) {
    showToast('Import error: ' + err.message);
  }
  e.target.value = '';
});

// ===== HISTORY PAGE =====
async function renderHistoryPage(query) {
  const list = document.getElementById('historyPageList');
  if (!list) return;
  try {
    let url = '/reports';
    if (query) url += `?search=${encodeURIComponent(query.trim())}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.reports || data.reports.length === 0) {
      list.innerHTML = '<div class="history-empty">No reports yet. Generate your first plan!</div>';
      return;
    }

    list.innerHTML = '';
    data.reports.forEach(r => {
      const item = document.createElement('div');
      item.className = 'history-item';
      const date = new Date(r.created_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      item.innerHTML = `
        <div class="history-item-title">${escapeHtml(r.goal)}</div>
        <div class="history-item-date">${date}</div>
        <div class="history-item-actions">
          <button class="load-btn" data-id="${r.id}">Open</button>
          <button class="pdf-btn" data-id="${r.id}">PDF</button>
          <button class="md-btn" data-id="${r.id}">MD</button>
          <button class="docx-btn" data-id="${r.id}">DOCX</button>
          <button class="del-btn" data-id="${r.id}">Delete</button>
        </div>
      `;
      list.appendChild(item);

      item.querySelector('.load-btn').addEventListener('click', () => loadReport(r.id));
      item.querySelector('.pdf-btn').addEventListener('click', (e) => { e.stopPropagation(); exportReportPdf(r.id); });
      item.querySelector('.md-btn').addEventListener('click', (e) => { e.stopPropagation(); exportReportMd(r.id); });
      item.querySelector('.docx-btn').addEventListener('click', (e) => { e.stopPropagation(); exportReportDocx(r.id); });
      item.querySelector('.del-btn').addEventListener('click', (e) => { e.stopPropagation(); deleteReport(r.id); });
    });
  } catch {
    list.innerHTML = '<div class="history-empty">Failed to load history.</div>';
  }
}

document.getElementById('historyPageSearch')?.addEventListener('input', (e) => {
  renderHistoryPage(e.target.value);
});

async function loadReport(id) {
  try {
    loadingOverlay.classList.add('visible');
    loadingMessage.textContent = 'Loading report...';

    const res = await fetch(`/reports/${id}`);
    if (!res.ok) throw new Error('Report not found');
    const data = await res.json();

    currentReportId = data.id;
    currentCards = data.report_json.cards;

    renderReport({ id: data.id, goal: data.goal, cards: data.report_json.cards });
    await loadActionsForReport(data.id);
    switchPage('home');
    showToast('Report loaded.');
  } catch (err) {
    showToast('Error: ' + err.message);
  } finally {
    loadingOverlay.classList.remove('visible');
  }
}

function exportReportPdf(id) {
  fetch(`/export/${id}`).then(r => r.blob()).then(b => downloadBlob(b, `goal-report-${id}.pdf`)).then(() => showToast('PDF exported!')).catch(() => showToast('Export failed.'));
}
function exportReportMd(id) {
  fetch(`/export/markdown/${id}`).then(r => r.text()).then(t => downloadBlob(new Blob([t],{type:'text/markdown'}), `goal-report-${id}.md`)).then(() => showToast('Markdown exported!')).catch(() => showToast('Export failed.'));
}
function exportReportDocx(id) {
  fetch(`/export/docx/${id}`).then(r => r.blob()).then(b => downloadBlob(b, `goal-report-${id}.docx`)).then(() => showToast('Word exported!')).catch(() => showToast('Export failed.'));
}

async function deleteReport(id) {
  if (!confirm('Delete this report?')) return;
  try {
    await fetch(`/reports/${id}`, { method: 'DELETE' });
    if (currentReportId === id) { currentReportId = null; reportContainer.classList.remove('visible'); }
    renderHistoryPage(document.getElementById('historyPageSearch')?.value);
    renderActionHistory();
    showToast('Report deleted.');
  } catch { showToast('Delete failed.'); }
}

// ===== ANALYTICS =====
async function renderAnalytics() {
  const container = document.getElementById('analyticsContent');
  if (!container) return;
  try {
    const res = await fetch('/analytics');
    const data = await res.json();

    container.innerHTML = `
      <div class="analytics-grid">
        <div class="stat-card"><div class="stat-value">${data.total_goals}</div><div class="stat-label">Total Goals</div></div>
        <div class="stat-card"><div class="stat-value">${data.completion_rate}%</div><div class="stat-label">Completion Rate</div></div>
        <div class="stat-card"><div class="stat-value">${data.completed_actions}</div><div class="stat-label">Actions Done</div></div>
        <div class="stat-card"><div class="stat-value">${data.avg_time_to_first_action}h</div><div class="stat-label">Avg Time to First Action</div></div>
      </div>
      <div class="chart-container"><div class="chart-title">Actions by Section</div><canvas id="sectionChart"></canvas></div>
      <div class="chart-container"><div class="chart-title">Goals Over Time</div><canvas id="trendChart"></canvas></div>
    `;

    const sections = data.section_breakdown || [];
    const sectionCtx = document.getElementById('sectionChart')?.getContext('2d');
    if (sectionCtx && sections.length) {
      new Chart(sectionCtx, {
        type: 'bar',
        data: {
          labels: sections.map(s => s.section.replace(/[^A-Za-z0-9 ]/g, '').substring(0, 18)),
          datasets: [
            { label: 'Total', data: sections.map(s => s.count), backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#8b5cf6' },
            { label: 'Completed', data: sections.map(s => s.completed), backgroundColor: '#22c55e' },
          ]
        },
        options: {
          responsive: true,
          plugins: { legend: { labels: { color: '#9ca3af', font: { size: 11 } } } },
          scales: { x: { ticks: { color: '#6b7280' } }, y: { ticks: { color: '#6b7280' } } }
        }
      });
    }

    const trends = data.goals_over_time || [];
    const trendCtx = document.getElementById('trendChart')?.getContext('2d');
    if (trendCtx && trends.length) {
      new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: trends.map(t => t.day).reverse(),
          datasets: [{
            label: 'Goals Created',
            data: trends.map(t => t.count).reverse(),
            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent2').trim() || '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            fill: true,
            tension: 0.4,
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { labels: { color: '#9ca3af', font: { size: 11 } } } },
          scales: { x: { ticks: { color: '#6b7280' } }, y: { ticks: { color: '#6b7280' } } }
        }
      });
    }
  } catch {
    container.innerHTML = '<div class="history-empty">Failed to load analytics.</div>';
  }
}

// ===== ACTION HISTORY (embedded in History page) =====
async function renderActionHistory() {
  const list = document.getElementById('actionHistoryList');
  if (!list) return;
  try {
    const res = await fetch('/actions/history');
    const data = await res.json();
    if (!data.actions || data.actions.length === 0) {
      list.innerHTML = '<div style="padding:1.5rem 0;text-align:center;font-size:0.8rem;color:var(--text-muted)">No completed actions yet.</div>';
      return;
    }
    const recent = data.actions.slice(0, 10);
    list.innerHTML = '';
    recent.forEach(a => {
      const item = document.createElement('div');
      item.className = 'action-history-item';
      item.innerHTML = `
        <div class="action-history-check">✓</div>
        <div class="action-history-body">
          <div class="action-history-text">${escapeHtml(a.action_text)}</div>
          <div class="action-history-meta">
            <span class="action-history-goal">${escapeHtml(a.goal)}</span>
            <span>${a.section}</span>
            <span>${formatDate(a.checked_at)}</span>
          </div>
        </div>
      `;
      list.appendChild(item);
    });
  } catch {
    list.innerHTML = '<div style="padding:1.5rem 0;text-align:center;font-size:0.8rem;color:var(--text-muted)">Failed to load.</div>';
  }
}

// ===== CALENDAR =====
async function renderCalendar() {
  const list = document.getElementById('calendarList');
  if (!list) return;
  try {
    const res = await fetch('/calendar');
    const data = await res.json();

    if (!data.events || data.events.length === 0) {
      list.innerHTML = '<div class="history-empty">No reports yet to show on timeline.</div>';
      return;
    }

    list.innerHTML = '';
    data.events.forEach(e => {
      const date = new Date(e.created_at);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const pct = e.total_actions > 0 ? Math.round(e.completed_actions / e.total_actions * 100) : 0;
      const item = document.createElement('div');
      item.className = 'calendar-item';
      item.innerHTML = `
        <div class="calendar-date">
          <div class="calendar-month">${months[date.getMonth()]}</div>
          <div class="calendar-day">${date.getDate()}</div>
        </div>
        <div class="calendar-info">
          <div class="cal-title">${escapeHtml(e.goal)}</div>
          <div class="cal-meta">
            <span>${e.total_actions} actions</span>
            <span>${e.completed_actions} done</span>
          </div>
        </div>
        <div class="cal-progress">
          <div class="cal-pct">${pct}%</div>
          <div class="cal-bar"><div class="cal-bar-fill" style="width:${pct}%"></div></div>
        </div>
      `;
      item.addEventListener('click', () => loadReport(e.id));
      list.appendChild(item);
    });
  } catch {
    list.innerHTML = '<div class="history-empty">Failed to load calendar.</div>';
  }
}

// ===== NOTIFICATIONS =====
function requestNotificationPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') Notification.requestPermission();
}

function sendLocalNotification(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try { new Notification(title, { body, icon: '/static/icon.png' }); } catch {}
}

async function checkDailyActions() {
  if (!currentReportId) return;
  try {
    const res = await fetch(`/actions/report/${currentReportId}`);
    const data = await res.json();
    const todayActions = data.actions.filter(a => a.section === 'TODAY' && !a.checked);
    const weekActions = data.actions.filter(a => a.section === 'THIS WEEK' && !a.checked);
    if (todayActions.length > 0) sendLocalNotification("Today's Actions", `You have ${todayActions.length} action(s) to do today!`);
    if (weekActions.length > 0) sendLocalNotification('This Week', `${weekActions.length} weekly action(s) waiting.`);
  } catch {}
}

// ===== URL PARAM =====
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const reportId = params.get('report');
  if (reportId) loadReport(parseInt(reportId));
  requestNotificationPermission();
  checkDailyActions();
  applyReportView();
});

// ===== UTILS =====
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toast._hide);
  toast._hide = setTimeout(() => toast.classList.remove('visible'), 3500);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
