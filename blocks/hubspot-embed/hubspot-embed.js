/* global hbspt */
import { div } from '../../scripts/domHelpers.js';
import { fetchPlaceholders, loadScript } from '../../scripts/aem.js';
import generateId from '../../scripts/stringHelper.js';
import getBlockCfg from '../../scripts/blockHelpers.js';

export const embedHubspot = async ({ jsUrl, portalId, formId, target }) => {
  await loadScript(`${jsUrl}?t=${target}`, { async: 'async', defer: 'defer' });
  hbspt.forms.create({
    portalId,
    formId,
    target: `#${target}`,
    onFormSubmitted: ($form, data) => {
      _satellite.track('hubspot_form_submit', { $form, data });
    },
  });
};

export const loadEmbed = async ({ block, jsUrl, portalId, formId, target }) => {
  if (block.classList.contains('embed-is-loaded')) {
    return;
  }

  await embedHubspot({
    jsUrl,
    portalId,
    formId,
    target,
  });

  block.classList = 'block embed embed-hbspt';
  block.classList.add('embed-is-loaded');
};

/**
 *
 * Hubspot Embed
 * -----
 * jsUrl = https://js.hsforms.net/forms/embed/v2.js
 * portalId = 252628
 * formId = 16ee4cd1-22e1-4755-af5c-698508b60675
 *
 * jsUrl and portalId are optional and defaults to values specified above if not present
 * formId is required field
 *
 * @param {*} block
 */
export default async function decorate(block) {
  const placeholders = await fetchPlaceholders();
  const { portalid: portalId } = placeholders;
  const { jsUrl, formId } = getBlockCfg(block, {
    jsUrl: 'https://js.hsforms.net/forms/embed/v2.js',
    portalId,
  });
  const target = `hbspt-embed-${generateId(5)}`;
  const form = div({
    id: target,
    class: 'hbspt-form',
  });

  block.innerHTML = '';
  block.appendChild(form);

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      loadEmbed({
        block,
        jsUrl,
        portalId,
        formId,
        target,
      });
    }
  });
  observer.observe(block);
}

/**
 * alternate way to load
 */
// async function decorateOld(block) {
//   const props = block.querySelectorAll('p');
//   const jsUrl = props[0].innerHTML;
//   const portalId = props[1].innerHTML;
//   const formId = props[2].innerHTML;
//   const target = `hbspt-embed-${generateId(5)}`;
//   const form = div({
//     id: target,
//     class: 'hbspt-form',
//   });

//   block.innerHTML = '';
//   block.appendChild(form);

//   passFormConfig({
//     portalId, formId, target,
//   });
// }
