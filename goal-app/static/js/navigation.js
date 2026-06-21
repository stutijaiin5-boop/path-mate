var App = window.App || {};
App.nav = {};

(function () {
  var pages = document.querySelectorAll('.page');
  var navLinks = document.querySelectorAll('.nav-link');
  var settingsToggle = document.getElementById('settingsToggle');
  var hamburgerBtn = document.getElementById('hamburgerBtn');
  var mobileDrawer = document.getElementById('mobileDrawer');

  function switchPage(pageId) {
    if (mobileDrawer) mobileDrawer.classList.remove('open');

    document.querySelectorAll('.nav-link').forEach(function (l) {
      l.classList.toggle('active', l.dataset.page === pageId);
    });
    if (settingsToggle) settingsToggle.classList.toggle('active', pageId === 'settings');
    pages.forEach(function (p) { p.classList.toggle('active', p.id === 'page-' + pageId); });

    if (pageId === 'analytics' && App.analytics) App.analytics.render();
    if (pageId === 'history' && App.history) {
      App.history.render();
      App.history.renderActions();
    }
    if (pageId === 'calendar' && App.calendar) App.calendar.render();

    if (pageId === 'settings') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  App.nav.switchPage = switchPage;

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () { switchPage(link.dataset.page); });
  });

  if (settingsToggle) {
    settingsToggle.addEventListener('click', function () { switchPage('settings'); });
  }

  if (hamburgerBtn && mobileDrawer) {
    hamburgerBtn.addEventListener('click', function () {
      mobileDrawer.classList.toggle('open');
    });
  }
})();
