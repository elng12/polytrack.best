// Unified Cookie Consent initialization
(function () {
  function loadAnalytics() {
    // GA4
    var ga = document.createElement('script');
    ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-Y841F5N4SD';
    document.head.appendChild(ga);
    var gtagInit = document.createElement('script');
    gtagInit.innerHTML = "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config','G-Y841F5N4SD');";
    document.head.appendChild(gtagInit);
    // AdSense
    var ads = document.createElement('script');
    ads.async = true;
    ads.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3219924658522446';
    ads.setAttribute('crossorigin','anonymous');
    document.head.appendChild(ads);
  }

  function runConsent() {
    if (!window.CookieConsent) return;
    try {
      window.CookieConsent.run({
        categories: { necessary: true, analytics: false },
        language: {
          en: {
            consentModal: {
              title: 'We use cookies',
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
          if (Array.isArray(cats) ? cats.includes('analytics') : cats.analytics) {
            loadAnalytics();
          }
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

