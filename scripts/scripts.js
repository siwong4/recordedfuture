import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateDefaultContentHeading,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  toClassName,
  getMetadata,
  loadScript,
  fetchPlaceholders,
} from './aem.js';

import { decorateSkipToMain } from '../blocks/skip-to-main/skip-to-main.js';
import { applyBackgroundStylesFromMetadata } from '../utils/helper.js';
import { updateLocaleInPath } from './localesHelper.js';

const TEMPLATE_LIST = ['get-started', 'get-in-touch', 'blog', 'articles-filter', 'case-study'];

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

async function loadCookieBanner() {
  const placeholders = await fetchPlaceholders();
  const { portalid: portalId } = placeholders;

  const fetchCookieBanner = async (portalId) => {
    const cookieScriptUrl = `https://js.hs-banner.com/${portalId}.js`;
    await loadScript(cookieScriptUrl);
  };

  fetchCookieBanner(portalId);
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * @typedef Template
 * @property {function} [loadLazy] If provided, will be called in the lazy phase. Expects a
 *  single argument: the document's <main> HTMLElement.
 * @property {function} [loadEager] If provided, will be called in the eager phase. Expects a single
 *  argument: the document's <main> HTMLElement.
 * @property {function} [loadDelayed] If provided, will be called in the delayed phase. Expects a
 *  single argument: the document's <main> HTMLElement.
 */

/**
 * @type {Template}
 */
let template;

/**
 * Invokes a template's eager method, if specified.
 * @param {Template} [toLoad] Template whose eager method should be invoked.
 * @param {HTMLElement} main The document's main element.
 * @param {Array} blocks The names of blocks to be built (optional)
 */
async function loadEagerTemplate(toLoad, main, blocks) {
  if (toLoad && toLoad.loadEager) {
    await toLoad.loadEager(main, blocks);
  }
}

/**
 * Invokes a template's lazy method, if specified.
 * @param {Template} [toLoad] Template whose lazy method should be invoked.
 * @param {HTMLElement} main The document's main element.
 */
async function loadLazyTemplate(toLoad, main) {
  if (toLoad) {
    if (toLoad.loadLazy) {
      await toLoad.loadLazy(main);
    }
  }
}

/**
 * Invokes a template's delayed method, if specified.
 * @param {Template} [toLoad] Template whose delayed method should be invoked.
 * @param {HTMLElement} main The document's main element.
 */
async function loadDelayedTemplate(toLoad, main) {
  if (toLoad && toLoad.loadDelayed) {
    await toLoad.loadDelayed(main);
  }
}

/**
 * Handles external links and PDFs to be opened in a new tab/window
 * @param {Element} main The main element
 */
export async function decorateExternalLinks(main) {
  const placeholders = await fetchPlaceholders();
  const { baseurl, testurl } = placeholders;

  main.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href) {
      const extension = href.split('.').pop().trim();
      if (!href.startsWith('/') && !href.startsWith('#')) {
        if (!(href.includes(baseurl) || href.includes(testurl)) || extension === 'pdf') {
          a.setAttribute('target', '_blank');
        }
      }
    }
  });
}

/**
 * Loads a template by concurrently requesting its CSS and javascript files, and invoking its
 * eager loading phase.
 * @param {string} templateName The name of the template to load.
 * @param {HTMLElement} main The document's main element.
 * @param {Array} blocks The names of blocks to be built (optional)
 * @returns {Promise<Template>} Resolves with the imported module after the template's files are
 *  loaded and its eager phase is complete.
 */
async function loadTemplate(templateName, main, blocks) {
  const cssLoaded = loadCSS(`${window.hlx.codeBasePath}/templates/${templateName}/${templateName}.css`);
  let module;
  const decorateComplete = new Promise((resolve) => {
    (async () => {
      module = await import(`../templates/${templateName}/${templateName}.js`);
      await loadEagerTemplate(module, main, blocks);
      resolve();
    })();
  });
  await Promise.all([cssLoaded, decorateComplete]);
  return module;
}

/**
 * Run template specific decoration code.
 * @param {Element} main The container element
 */
async function decorateTemplates(main) {
  try {
    const templateName = toClassName(getMetadata('template'));
    const templates = TEMPLATE_LIST;

    if (templateName === 'off') return;

    if (templates.includes(templateName)) {
      template = await loadTemplate(templateName, main);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('template loading failed', error);
  }
}

/**
 * Builds the page footer contents
 * @param {Element} main
 */
async function buildEngagementFooter(main) {
  try {
    const footerBlocks = getMetadata('engagement')
      .split(',')
      .map((block) => block.trim());

    if (footerBlocks) {
      await loadTemplate('engagement', main, footerBlocks);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('template loading failed', error);
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Add button role to anchor button
 * @param {Element} main
 */
function decorateButtonsWithRole(main) {
  decorateButtons(main);
  main.querySelectorAll('a').forEach((a) => {
    if (a.classList.contains('button')) {
      a.role = 'button';
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateTemplateAndTheme();
  decorateButtonsWithRole(main);
  decorateIcons(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateDefaultContentHeading(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const header = await loadHeader(doc.querySelector('header'));
  header && decorateExternalLinks(header);
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    await decorateTemplates(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  const canonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
  canonical.rel = 'canonical';
  canonical.href = window.location.origin + window.location.pathname;
  if (!document.head.contains(canonical)) {
    document.head.appendChild(canonical);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);
  await buildEngagementFooter(main);
  await loadLazyTemplate(template, main);
  await decorateExternalLinks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  await loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  applyBackgroundStylesFromMetadata(main);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  window.setTimeout(async () => {
    import('./delayed.js');
    loadScript('/scripts/gtm.js', { defer: true });
    await loadCookieBanner();
  }, 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  decorateSkipToMain();
  loadDelayed();
  updateLocaleInPath();
}

loadPage();
