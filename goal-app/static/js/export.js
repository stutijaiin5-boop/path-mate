var App = window.App || {};
App.exportFn = {};

(function () {
  document.getElementById('exportBtn').addEventListener('click', async function () {
    if (!App.currentReportId) return;
    try {
      var res = await fetch('/export/' + App.currentReportId);
      if (!res.ok) throw new Error('Export failed');
      var blob = await res.blob();
      App.utils.downloadBlob(blob, 'goal-report-' + App.currentReportId + '.pdf');
      App.utils.showToast('PDF exported!');
    } catch (err) { App.utils.showToast('Error: ' + err.message); }
  });

  document.getElementById('exportMdBtn').addEventListener('click', async function () {
    if (!App.currentReportId) return;
    try {
      var res = await fetch('/export/markdown/' + App.currentReportId);
      if (!res.ok) throw new Error('Export failed');
      var text = await res.text();
      App.utils.downloadBlob(new Blob([text], { type: 'text/markdown' }), 'goal-report-' + App.currentReportId + '.md');
      App.utils.showToast('Markdown exported!');
    } catch (err) { App.utils.showToast('Error: ' + err.message); }
  });

  document.getElementById('exportDocxBtn').addEventListener('click', async function () {
    if (!App.currentReportId) return;
    try {
      var res = await fetch('/export/docx/' + App.currentReportId);
      if (!res.ok) throw new Error('Export failed');
      var blob = await res.blob();
      App.utils.downloadBlob(blob, 'goal-report-' + App.currentReportId + '.docx');
      App.utils.showToast('Word document exported!');
    } catch (err) { App.utils.showToast('Error: ' + err.message); }
  });

  document.getElementById('exportZipBtn').addEventListener('click', async function () {
    try {
      var res = await fetch('/export/zip');
      if (!res.ok) throw new Error('Export failed');
      App.utils.downloadBlob(await res.blob(), 'all-reports.zip');
      App.utils.showToast('All reports exported as ZIP!');
    } catch (err) { App.utils.showToast('Error: ' + err.message); }
  });

  document.getElementById('shareBtn').addEventListener('click', async function () {
    if (!App.currentReportId) return;
    var url = window.location.origin + '/?report=' + App.currentReportId;
    try {
      await navigator.clipboard.writeText(url);
      App.utils.showToast('Report link copied to clipboard!');
    } catch (e) { App.utils.showToast('Link: ' + url); }
  });
})();
