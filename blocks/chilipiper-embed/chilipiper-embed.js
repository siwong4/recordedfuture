/* global ChiliPiper  */
import { div } from '../../scripts/domHelpers.js';
import { loadScript } from '../../scripts/aem.js';
import generateId from '../../scripts/stringHelper.js';
import getBlockCfg from '../../scripts/blockHelpers.js';

export const embedChilipiper = async ({ jsUrl, domain, router, formType, target }) => {
  await loadScript(`${jsUrl}?t=${target}`, { async: 'async', defer: 'defer' });
  ChiliPiper.deploy(domain, router, { formType });
};

export const loadEmbed = async ({ block, jsUrl, domain, router, formType, target }) => {
  if (block.classList.contains('embed-is-loaded')) {
    return;
  }

  await embedChilipiper({
    jsUrl,
    domain,
    router,
    formType,
    target,
  });

  block.classList = 'block embed embed-chilipiper';
  block.classList.add('embed-is-loaded');
};

/**
 *
 * Chilipiper Embed
 * -----
 * jsUrl = https://recordedfuture.chilipiper.com/concierge-js/cjs/concierge.js
 * domain = recordedfuture
 * router = demo-request
 * formType = Hubspot
 *
 * jsUrl, domain are optional and defaults to values specified above if not present
 * formId is required field
 *
 * @param {*} block
 */
export default async function decorate(block) {
  const { jsUrl, domain, router, formType } = getBlockCfg(block, {
    jsUrl: 'https://recordedfuture.chilipiper.com/concierge-js/cjs/concierge.js',
    domain: 'recordedfuture',
    // router: 'demo-request',
    // formType: 'Hubspot',
  });
  const target = `chilipiper-embed-${generateId(5)}`;
  const cp = div({
    id: target,
    class: 'chilipiper-embed-main',
  });

  block.innerHTML = '';
  block.appendChild(cp);

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      loadEmbed({
        block,
        jsUrl,
        domain,
        router,
        formType,
        target,
      });
    }
  });
  observer.observe(block);
}
