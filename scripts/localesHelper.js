import { fetchPlaceholders } from './aem.js';

const { baseurl: BASE_URL } = await fetchPlaceholders();

export const updateLocaleInPath = () => {
  const locale = localStorage.getItem('lang');
  if (!locale || locale === 'en') return;

  document.querySelectorAll('a[href]').forEach((link) => {
    const isExternal = !link.href.includes(BASE_URL) && !link.href.includes(window.location.origin);
    if (isExternal) return;

    const url = new URL(link.href, window.location.origin);
    const pathSegments = url.pathname.split('/').filter(Boolean);

    if (pathSegments[0] !== locale) {
      url.pathname = `/${locale}/${pathSegments.join('/')}`;
      link.href = url.toString();
    }
  });
};
