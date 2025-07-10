export default function decorate(block) {
  [...block.children].forEach((locale) => {
    // removes locale code column
    const localeLabel = locale.querySelector(':scope > div:first-child p')?.innerText;
    const localeCode = locale.querySelector(':scope > div:last-child p')?.innerText;

    if (localeLabel && localeCode) {
      const localeSwitchButton = document.createElement('button');
      localeSwitchButton.setAttribute('type', 'button');
      localeSwitchButton.innerText = localeLabel;
      localeSwitchButton.addEventListener('click', () => {
        const pathParts = window.location.pathname.split('/').filter(Boolean);

        if (pathParts[0] && pathParts[0].length === 2) {
          pathParts.shift();
        }

        const newPath = localeCode === 'en' ? `/${pathParts.join('/')}` : `/${localeCode}/${pathParts.join('/')}`;
        const newUrl = newPath + window.location.search + window.location.hash;

        if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== newUrl) {
          window.location.href = newUrl;
          localStorage.setItem('lang', localeCode);
        }
      });

      locale.innerHTML = '';
      locale.append(localeSwitchButton);
    }
  });
}
