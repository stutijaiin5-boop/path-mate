var App = window.App || {};
App.render = {};

(function () {
  var reportContainer = document.getElementById('reportContainer');
  var cardsGrid = document.getElementById('cardsGrid');
  var reportGoal = document.getElementById('reportGoal');
  var reportIdDisplay = document.getElementById('reportIdDisplay');
  var searchInput = document.getElementById('searchInput');
  var searchClear = document.getElementById('searchClear');

  var actionData = {};

  var reportView = localStorage.getItem('reportView') || 'full';

  function applyReportView() {
    var briefBtn = document.getElementById('viewBriefBtn');
    var fullBtn = document.getElementById('viewFullBtn');
    if (briefBtn) briefBtn.classList.toggle('active', reportView === 'brief');
    if (fullBtn) fullBtn.classList.toggle('active', reportView === 'full');
    document.querySelectorAll('.card-content').forEach(function (el) {
      el.classList.toggle('collapsed', reportView === 'brief');
    });
    document.querySelectorAll('.card-expand-btn').forEach(function (el) {
      el.classList.toggle('visible', reportView === 'brief');
      if (reportView === 'brief') {
        el.textContent = '▼ Expand';
      }
    });
  }

  App.render.applyReportView = applyReportView;

  function renderReport(data) {
    reportGoal.textContent = data.goal;
    reportIdDisplay.textContent = '#' + data.id;
    cardsGrid.innerHTML = '';

    data.cards.forEach(function (cardData) {
      var card = document.createElement('div');
      card.className = 'glass-card' + (cardData.extra_class ? ' ' + cardData.extra_class : '');

      var badgeHtml = cardData.badge
        ? '<span class="priority-badge ' + cardData.priority + '">' + cardData.badge + '</span>'
        : '';

      card.innerHTML =
        '<div class="card-header">' +
          '<div class="card-icon">' + cardData.icon + '</div>' +
          '<div class="card-title-group">' +
            '<div class="card-title">' + cardData.title + '</div>' +
            badgeHtml +
          '</div>' +
        '</div>' +
        '<div class="card-content' + (reportView === 'brief' ? ' collapsed' : '') + '">' + cardData.content + '</div>' +
        '<button class="card-expand-btn' + (reportView === 'brief' ? ' visible' : '') + '">' +
          (reportView === 'brief' ? '▼ Expand' : '') +
        '</button>';

      cardsGrid.appendChild(card);

      var expandBtn = card.querySelector('.card-expand-btn');
      var content = card.querySelector('.card-content');
      if (expandBtn) {
        expandBtn.addEventListener('click', function () {
          var isCollapsed = content.classList.toggle('collapsed');
          expandBtn.textContent = isCollapsed ? '▼ Expand' : '▲ Collapse';
        });
      }
    });

    reportContainer.classList.add('visible');
    reportContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

    document.querySelectorAll('.action-cb').forEach(function (cb) {
      cb.addEventListener('change', handleActionCheck);
    });

    burstSparkles();

    setTimeout(function () {
      document.querySelectorAll('.risk-bar-fill').forEach(function (bar) {
        var w = bar.style.width;
        bar.style.width = '0%';
        setTimeout(function () { bar.style.width = w; }, 100);
      });
    }, 300);
  }

  App.render.renderReport = renderReport;

  function burstSparkles() {
    var colors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#22c55e', '#ef4444', '#ec4899'];
    for (var i = 0; i < 24; i++) {
      var sparkle = document.createElement('div');
      sparkle.style.cssText =
        'position:fixed;pointer-events:none;z-index:9999;' +
        'width:' + (Math.random() * 5 + 2) + 'px;height:' + (Math.random() * 5 + 2) + 'px;' +
        'background:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
        'border-radius:50%;' +
        'left:' + (40 + Math.random() * 20) + '%;' +
        'top:' + (40 + Math.random() * 20) + '%;' +
        'opacity:1;' +
        'box-shadow:0 0 6px currentColor;';
      document.body.appendChild(sparkle);
      var angle = Math.random() * Math.PI * 2;
      var velocity = 100 + Math.random() * 180;
      var dx = Math.cos(angle) * velocity;
      var dy = Math.sin(angle) * velocity;
      sparkle.animate([
        { transform: 'translate(0,0) scale(0)', opacity: 1 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(1)', opacity: 0.8, offset: 0.3 },
        { transform: 'translate(' + (dx * 1.3) + 'px,' + (dy * 1.3) + 'px) scale(0)', opacity: 0 }
      ], {
        duration: 700 + Math.random() * 500,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }).onfinish = function () { sparkle.remove(); };
    }
  }

  async function loadActions(reportId) {
    try {
      var res = await fetch('/actions/report/' + reportId);
      var data = await res.json();
      actionData = {};
      data.actions.forEach(function (a) { actionData[a.id] = a; });

      document.querySelectorAll('.action-cb').forEach(function (cb) {
        var actionId = parseInt(cb.dataset.actionId);
        if (actionId && actionData[actionId]) {
          var action = actionData[actionId];
          cb.checked = action.checked;
          if (action.checked) {
            cb.classList.add('checked-item');
            var ts = document.createElement('span');
            ts.className = 'action-checked-at';
            ts.textContent = App.utils.formatDate(action.checked_at);
            if (cb.nextSibling) {
              cb.parentNode.insertBefore(ts, cb.nextSibling.nextSibling);
            }
          }
        }
      });
    } catch (e) {}
  }

  App.render.loadActions = loadActions;

  async function handleActionCheck(e) {
    var cb = e.target;
    var actionId = parseInt(cb.dataset.actionId);
    if (!actionId) return;
    try {
      var res = await fetch('/actions/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_id: actionId, checked: cb.checked }),
      });
      if (!res.ok) throw new Error('Toggle failed');
      var updated = await res.json();
      actionData[updated.id] = updated;
      if (updated.checked) {
        cb.classList.add('checked-item');
        var existing = cb.parentNode.querySelector('.action-checked-at');
        if (existing) existing.remove();
        var ts = document.createElement('span');
        ts.className = 'action-checked-at';
        ts.textContent = App.utils.formatDate(updated.checked_at);
        if (cb.nextSibling) {
          cb.parentNode.insertBefore(ts, cb.nextSibling.nextSibling);
        }
        App.utils.showToast('Action completed! ✅');
      } else {
        cb.classList.remove('checked-item');
        var ts2 = cb.parentNode.querySelector('.action-checked-at');
        if (ts2) ts2.remove();
      }
    } catch (e) {
      cb.checked = !cb.checked;
      App.utils.showToast('Failed to update action.');
    }
  }

  // Search within report
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var query = searchInput.value.toLowerCase().trim();
      if (searchClear) searchClear.classList.toggle('visible', query.length > 0);
      document.querySelectorAll('.glass-card').forEach(function (card) {
        var text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }
  if (searchClear) {
    searchClear.addEventListener('click', function () {
      searchInput.value = '';
      searchClear.classList.remove('visible');
      document.querySelectorAll('.glass-card').forEach(function (c) { c.style.display = ''; });
    });
  }

  // View toggle
  var viewBriefBtn = document.getElementById('viewBriefBtn');
  var viewFullBtn = document.getElementById('viewFullBtn');
  if (viewBriefBtn) {
    viewBriefBtn.addEventListener('click', function () {
      reportView = 'brief';
      localStorage.setItem('reportView', 'brief');
      applyReportView();
    });
  }
  if (viewFullBtn) {
    viewFullBtn.addEventListener('click', function () {
      reportView = 'full';
      localStorage.setItem('reportView', 'full');
      applyReportView();
    });
  }
})();
