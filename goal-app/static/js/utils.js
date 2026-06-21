var App = window.App || {};

App.utils = {
  showToast: function (message) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toast._hide);
    toast._hide = setTimeout(function () { toast.classList.remove('visible'); }, 3500);
  },

  downloadBlob: function (blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  formatDate: function (iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  },

  escapeHtml: function (str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  requestNotificationPermission: function () {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') Notification.requestPermission();
  },

  sendLocalNotification: function (title, body) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try { new Notification(title, { body: body, icon: '/static/icon.png' }); } catch (e) {}
  },

  isValidEmail: function (email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
};
