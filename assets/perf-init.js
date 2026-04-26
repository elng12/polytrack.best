// Initialize Web Vitals reporting (requires /assets/web-vitals.iife.js)
(function () {
  function sendToGA(metric) {
    if (typeof window.gtag === 'function') {
      var name = metric.name || metric.id || 'metric';
      var value = metric.value || 0;
      window.gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: name,
        value: Math.round(name === 'CLS' ? value * 1000 : value)
      });
    }
  }

  function init() {
    if (!window.webVitals) return;
    try {
      var vitals = window.webVitals;
      (vitals.onCLS || vitals.getCLS)(sendToGA);
      (vitals.onFID || vitals.getFID)(sendToGA);
      (vitals.onLCP || vitals.getLCP)(sendToGA);
      if (vitals.onINP || vitals.getINP) (vitals.onINP || vitals.getINP)(sendToGA);
      if (vitals.onFCP || vitals.getFCP) (vitals.onFCP || vitals.getFCP)(sendToGA);
      if (vitals.onTTFB || vitals.getTTFB) (vitals.onTTFB || vitals.getTTFB)(sendToGA);
    } catch (e) {
      console.warn('[perf-init] web-vitals failed:', e && e.message ? e.message : e);
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 0);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
