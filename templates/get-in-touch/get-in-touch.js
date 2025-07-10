function buildGetInTouchSection(main) {
  const getInTouchSection = document.createElement('div');
  getInTouchSection.classList.add('section');
  getInTouchSection.classList.add('get-in-touch-container');

  const getInTouchWrapper = document.createElement('div');
  getInTouchWrapper.classList.add('get-in-touch-wrapper');
  getInTouchSection.appendChild(getInTouchWrapper);

  const leftPanelSection = main.querySelector('[data-section="get-in-touch-left-panel"]');
  getInTouchWrapper.appendChild(leftPanelSection.cloneNode(true));

  const hubspotSection = main.querySelector('.section.hubspot-embed-container');
  if (hubspotSection) {
    getInTouchWrapper.appendChild(hubspotSection.cloneNode(true));
    hubspotSection.remove();
  }

  leftPanelSection.replaceWith(getInTouchSection);
}

// eslint-disable-next-line import/prefer-default-export
export function loadEager(main) {
  buildGetInTouchSection(main);
}
