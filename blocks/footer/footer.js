import { getMetadata, loadScript, fetchPlaceholders } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const { baseurl: BASE_URL } = await fetchPlaceholders();

const getFormConfig = async () => {
  const placeholders = await fetchPlaceholders();
  const { portalid: portalId, formid: formId } = placeholders;
  return { portalId, formId };
};

const createFormWrapper = () => {
  const formWrapper = document.createElement('div');
  formWrapper.classList.add('newsletter-form-wrapper');
  formWrapper.innerHTML = `<div id="hubspot-form" class="newsletter-form"></div>`;
  return formWrapper;
};

const createHubspotForm = async () => {
  const { portalId, formId } = await getFormConfig();

  hbspt.forms.create({
    portalId,
    formId,
    target: '#hubspot-form',
    css: '',
    cssClass: 'hs-form-custom',
    onFormSubmitted: ($form, data) => {
      _satellite.track('hubspot_form_submit', { $form, data });
    },
  });
};

const initializeHubspotForm = async () => {
  // only load HubSpot script once
  if (!window.hbspt) {
    await loadScript('https://js.hsforms.net/forms/v2.js');
  }
  await createHubspotForm();

  // update form placeholder
  const { formId } = await getFormConfig();
  const observer = new MutationObserver((mutations, obs) => {
    const input = document.querySelector(`#email-${formId}`);
    if (input) {
      input.placeholder = 'Email';
      obs.disconnect();
    }
    const form = document.querySelector(`#hsForm_${formId} > div.hs_submit.hs-submit > div.actions > input`);
    if (form) {
      form.value = 'Subscribe for Free';
      obs.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
};

const wrapLinks = (mainSection) => {
  const linkContainers = mainSection.querySelectorAll('.button-container');
  const linkWrapper = document.createElement('div');
  linkWrapper.classList.add('footer-links');
  linkContainers.forEach((linkContainer) => {
    linkWrapper.appendChild(linkContainer);
  });
  mainSection.querySelector('.default-content-wrapper').appendChild(linkWrapper);

  linkContainers.forEach((linkContainer) => {
    linkContainer.classList.add('footer-link');
    linkContainer.classList.remove('button-container');
    const anchor = linkContainer.querySelector('a');
    if (!anchor.href.includes(BASE_URL) && !anchor.href.includes(window.location.origin)) {
      anchor.classList.add('external');
    }
    anchor.classList.add('footer-link-anchor');
    anchor.classList.remove('button');
  });
};

const wrapCopyright = (copyrightSection) => {
  const copyrightWrapper = copyrightSection.querySelector('.default-content-wrapper');
  if (!copyrightWrapper) return;

  copyrightWrapper.classList.add('footer-copy');
  copyrightWrapper.querySelector(':scope > p').classList.add('copyright');

  const socialWrapper = document.createElement('div');
  socialWrapper.classList.add('footer-socials');

  const socials = [...copyrightWrapper.querySelectorAll('p')].filter((p) => p.querySelector('span.icon'));
  socials.forEach((social) => {
    social.classList.remove('button-container');

    const anchor = social.querySelector('a.button');
    if (anchor) {
      anchor.classList.remove('button');
      const iconImage = anchor.querySelector('img[data-icon-name]');
      const iconName = iconImage ? iconImage.getAttribute('data-icon-name') : '';
      anchor.setAttribute('aria-label', iconName);
    }
    socialWrapper.appendChild(social);
  });

  copyrightWrapper.appendChild(socialWrapper);
};

const wrapLogo = (mainSection) => {
  const logoContainer = mainSection.querySelector('p:first-child picture')?.parentElement;
  const brandMessage = mainSection.querySelector('.branding-message');

  if (!logoContainer || !brandMessage) {
    // eslint-disable-next-line no-console
    console.warn('Missing required branding elements in footer');
    return;
  }

  const brandWrapper = document.createElement('div');
  brandWrapper.classList.add('footer-brand');

  brandWrapper.appendChild(logoContainer);
  brandWrapper.appendChild(brandMessage);

  const defaultContentWrapper = mainSection.querySelector('.default-content-wrapper');
  defaultContentWrapper?.insertBefore(brandWrapper, defaultContentWrapper.firstChild);
};

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */

export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
  block.append(footer);

  const newsletterSection = block.querySelector('[data-section="newsletter"]');
  const wrapper = newsletterSection.querySelector('.default-content-wrapper');

  const newsletterForm = createFormWrapper();
  await initializeHubspotForm();

  if (wrapper) {
    wrapper.appendChild(newsletterForm);
  } else {
    newsletterSection.appendChild(newsletterForm);
  }

  // main footer section
  const mainSection = footer.querySelector('[data-section="main"]');
  const brandingMessage = mainSection.querySelector('p:nth-child(2)');
  brandingMessage.classList.add('branding-message');

  // footer logo
  wrapLogo(mainSection);
  const logoContainer = mainSection.querySelector('p');
  logoContainer.classList.add('footer-logo');

  // add a wrapper for links
  wrapLinks(mainSection);

  // add wrapper for copyright
  const copyrightSection = block.querySelector('[data-section="copyright"]');
  wrapCopyright(copyrightSection);
}
