(function (w, d, s, l, i) {
  w[l] = w[l] || [];
  w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  var f = d.getElementsByTagName(s)[0],
    j = d.createElement(s),
    dl = l != 'dataLayer' ? '&l=' + l : '';
  j.async = true;
  j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
  f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', 'GTM-539N74N');

function addGTMNoscript(containerId) {
  var noscript = document.createElement('noscript');

  noscript.innerHTML =
    '<iframe src="https://www.googletagmanager.com/ns.html?id=' +
    containerId +
    '" height="0" width="0" style="display:none;visibility:hidden"></iframe>';

  if (document.body) {
    document.body.insertBefore(noscript, document.body.firstChild);
  } else {
    // If called before body, wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function () {
      document.body.insertBefore(noscript, document.body.firstChild);
    });
  }
}

addGTMNoscript('GTM-539N74N');
