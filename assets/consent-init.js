(function () {
  var CONFIG = {
    gaMeasurementId: '',
    adsClientId: 'ca-pub-3219924658522446'
  };

  function loadAnalytics() {
    if (!CONFIG.gaMeasurementId) return;
    var ga = document.createElement('script');
    ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CONFIG.gaMeasurementId);
    document.head.appendChild(ga);
    var gtagInit = document.createElement('script');
    gtagInit.innerHTML = "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config','" + CONFIG.gaMeasurementId + "');";
    document.head.appendChild(gtagInit);
  }

  function loadAds() {
    if (!CONFIG.adsClientId) return;
    var ads = document.createElement('script');
    ads.async = true;
    ads.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(CONFIG.adsClientId);
    ads.setAttribute('crossorigin', 'anonymous');
    document.head.appendChild(ads);
  }

  function runConsent() {
    if (!window.CookieConsent) return;
    try {
      window.CookieConsent.run({
        categories: { necessary: true, analytics: false, advertising: false },
        language: {
          en: {
            consentModal: {
              title: 'We use cookies',
              description: 'We use cookies to improve your experience and show relevant ads.',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all'
            },
            preferencesModal: {
              title: 'Cookie settings',
              acceptAllBtn: 'Accept all',
              savePreferencesBtn: 'Save settings'
            }
          }
        },
        onAccept: function (ctx) {
          var cats = ctx && (ctx.categories || ctx.accepted || ctx.preferences) || [];
          var catList = Array.isArray(cats) ? cats : Object.keys(cats).filter(function(k){ return cats[k]; });
          if (catList.includes('analytics')) loadAnalytics();
          if (catList.includes('advertising')) loadAds();
        }
      });
    } catch (e) {
      console.warn('[consent-init] failed:', e && e.message ? e.message : e);
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(runConsent, 0);
  } else {
    document.addEventListener('DOMContentLoaded', runConsent);
  }
})();
