var App = window.App || {};
App.generate = {};

(function () {
  var goalInput = document.getElementById('goalInput');
  var situationInput = document.getElementById('situationInput');
  var generateBtn = document.getElementById('generateBtn');
  var loadingOverlay = document.getElementById('loadingOverlay');
  var loadingMessage = document.getElementById('loadingMessage');

  var loadingMessages = [
    'Analyzing your execution gap...',
    'Mapping your current state...',
    'Identifying leverage points...',
    'Building your roadmap...',
    'Calculating success metrics...',
    'Finding your first action...',
  ];

  async function generateReport() {
    var goal = goalInput.value.trim();
    var situation = situationInput.value.trim();

    if (!goal || !situation) {
      App.utils.showToast('Please enter both your goal and current situation.');
      return;
    }

    generateBtn.disabled = true;
    generateBtn.innerHTML = 'Generating...';

    var msgIndex = 0;
    var msgInterval = setInterval(function () {
      msgIndex = (msgIndex + 1) % loadingMessages.length;
      loadingMessage.textContent = loadingMessages[msgIndex];
    }, 2000);
    loadingMessage.textContent = loadingMessages[0];
    loadingOverlay.classList.add('visible');

    try {
      var res = await fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goal, current_situation: situation }),
      });

      if (!res.ok) {
        var err = await res.json();
        throw new Error(err.detail || 'Generation failed');
      }

      var data = await res.json();
      App.currentReportId = data.id;
      App.currentCards = data.cards;

      App.render.renderReport(data);
      await App.render.loadActions(data.id);

      if (App.history) {
        App.history.render();
        App.history.renderActions();
      }
      App.nav.switchPage('home');
    } catch (err) {
      App.utils.showToast('Error: ' + err.message);
    } finally {
      clearInterval(msgInterval);
      loadingOverlay.classList.remove('visible');
      generateBtn.disabled = false;
      generateBtn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> Generate Execution Plan <span class="keyboard-hint">⌘⏎</span>';
    }
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', generateReport);
  }
  if (goalInput) {
    goalInput.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.metaKey) generateReport(); });
  }
  if (situationInput) {
    situationInput.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.metaKey) generateReport(); });
  }
})();
