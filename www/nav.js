// AlgoPulse navigation glue: makes the bottom tab bar (and a few buttons) switch between screens.
(function () {
  var ROUTES = {
    'chart': 'algopulse_chart_terminal',
    'strategy': 'algopulse_strategy_backtest',
    'auto-trade': 'algopulse_auto_trade_bot',
    'screener': 'algopulse_market_screener',
    'menu': 'algopulse_settings_menu'
  };
  var TEXT_ROUTES = [
    [/^\s*pine\s*script/i, 'algopulse_pine_script_v5_studio'],
    [/^\s*leaderboard/i, 'algopulse_strategy_leaderboard']
  ];
  function go(dir) { location.href = new URL('../' + dir + '/code.html', location.href).href; }
  document.addEventListener('click', function (e) {
    var tab = e.target.closest && e.target.closest('a[data-path]');
    if (tab && ROUTES[tab.getAttribute('data-path')]) {
      e.preventDefault();
      go(ROUTES[tab.getAttribute('data-path')]);
      return;
    }
    var btn = e.target.closest && e.target.closest('button, a');
    if (btn && !btn.hasAttribute('onclick') && !btn.id) {
      var t = (btn.textContent || '').trim();
      for (var i = 0; i < TEXT_ROUTES.length; i++) {
        if (TEXT_ROUTES[i][0].test(t) && t.length < 40) { e.preventDefault(); go(TEXT_ROUTES[i][1]); return; }
      }
    }
  }, true);
})();
