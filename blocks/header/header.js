import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 1200px)');
const isMobile = window.matchMedia('(max-width: 600px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    const searchInputWrapper = document.querySelector('.nav-search-wrapper');
    const localesWrapper = document.querySelector('.locales-wrapper');

    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }

    if (searchInputWrapper && searchInputWrapper.getAttribute('aria-expanded') === 'true') {
      toggleDropdown(searchInputWrapper);
    }

    if (localesWrapper && localesWrapper.getAttribute('aria-expanded') === 'true') {
      toggleDropdown(localesWrapper);
    }
  }
}

function closeOnFocusLost(e, nav) {
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    const searchInputWrapper = document.querySelector('.nav-search-wrapper');
    const localesWrapper = document.querySelector('.locales-wrapper');

    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }

    if (searchInputWrapper && searchInputWrapper.getAttribute('aria-expanded') === 'true') {
      toggleDropdown(searchInputWrapper);
    }

    if (localesWrapper && localesWrapper.getAttribute('aria-expanded') === 'true') {
      toggleDropdown(localesWrapper);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function preventHyphenBreaks(element) {
  element.innerHTML = element.innerHTML.replace(/\b(\w+-\w+)\b/g, '<span style="white-space: nowrap;">$1</span>');
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  if (nav.getAttribute('aria-expanded') === 'true' && isMobile.matches) {
    document.body.style.overflowY = 'hidden';
  } else {
    document.body.style.overflowY = 'auto';
  }

  button.innerHTML = !expanded
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="37" viewBox="0 0 36 37" fill="none">
  <mask id="mask0_16350_21564" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="37">
  <rect x="0.625" y="1.125" width="34.75" height="34.75" fill="#D9D9D9" stroke="#F0F6FF" stroke-width="1.25"/>
  </mask>
  <g mask="url(#mask0_16350_21564)">
  <path d="M9.6001 27.6496L8.8501 26.8996L17.2501 18.4996L8.8501 10.0996L9.6001 9.34961L18.0001 17.7496L26.4001 9.34961L27.1501 10.0996L18.7501 18.4996L27.1501 26.8996L26.4001 27.6496L18.0001 19.2496L9.6001 27.6496Z" fill="white" stroke="white" stroke-width="1.25"/>
  </g>
  </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="37" viewBox="0 0 36 37" fill="none">
  <mask id="mask0_16350_24426" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="37">
  <rect y="0.5" width="36" height="36" fill="#D9D9D9"/>
  </mask>
  <g mask="url(#mask0_16350_24426)">
  <path d="M5.24902 11V8.75H30.749V11H5.24902ZM5.24902 28.25V26H30.749V28.25H5.24902ZM5.24902 19.625V17.375H30.749V19.625H5.24902Z" fill="white"/>
  </g>
  </svg>`;
}

function closeAllNavDrops() {
  document.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((section) => {
    section.setAttribute('aria-expanded', 'false');
  });

  const searchInputWrapper = document.querySelector('.nav-search-wrapper');
  const localesWrapper = document.querySelector('.locales-wrapper');

  [searchInputWrapper, localesWrapper].forEach((wrapper) => {
    if (wrapper && wrapper.getAttribute('aria-expanded') === 'true') {
      wrapper.setAttribute('aria-expanded', 'false');
      wrapper.style.display = 'none';
    }
  });
}

function toggleDropdown(dropEl) {
  const expanded = dropEl.getAttribute('aria-expanded') === 'true';

  closeAllNavDrops();
  dropEl.setAttribute('aria-expanded', expanded ? 'false' : 'true');

  if (dropEl.classList.contains('nav-search-wrapper') || dropEl.classList.contains('locales-wrapper')) {
    dropEl.style.display = expanded ? 'none' : 'block';
  }
}

function handleSearchSubmit() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) {
    console.error('Search input not found!');
    return;
  }
  const query = searchInput.value.trim();
  if (query !== '') {
    const url = `/search?query=${encodeURIComponent(query)}`;
    window.location.href = url;
  } else {
    // eslint-disable-next-line no-console
    console.log('Query is empty, not navigating');
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // add labels to home logo
  const logoWrapper = fragment.firstElementChild;
  if (logoWrapper) {
    const linkElement = logoWrapper.querySelector('a');
    const imgElement = logoWrapper.querySelector('img');

    linkElement.setAttribute('aria-label', '');
    linkElement.setAttribute('title', '');
    imgElement.alt = 'RecordedFuture logo';
  }

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'search', 'locales', 'cta'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
        <span class="nav-hamburger-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="37" viewBox="0 0 36 37" fill="none">
    <mask id="mask0_16350_24426" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="37">
    <rect y="0.5" width="36" height="36" fill="#D9D9D9"/>
    </mask>
    <g mask="url(#mask0_16350_24426)">
    <path d="M5.24902 11V8.75H30.749V11H5.24902ZM5.24902 28.25V26H30.749V28.25H5.24902ZM5.24902 19.625V17.375H30.749V19.625H5.24902Z" fill="white"/>
    </g>
    </svg>
        </span>
      </button>`;

  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.insertBefore(hamburger, navSections);

  // sections
  const navFragment = navSections.querySelector(':scope > .fragment-wrapper');

  // rearrange sections and fragments
  const contentWrappers = navSections.querySelectorAll('.default-content-wrapper > ul > li');
  if (contentWrappers.length > 1) {
    const mergedContentWrapper = document.createElement('div');
    mergedContentWrapper.className = 'default-content-wrapper';
    const mergedContentWrapperList = document.createElement('ul');
    contentWrappers.forEach((listItem) => {
      mergedContentWrapperList.appendChild(listItem.cloneNode(true));
    });
    mergedContentWrapper.append(mergedContentWrapperList);
    navSections.innerHTML = '';
    navSections.append(mergedContentWrapper, navFragment);
  }

  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      // Navigation label
      const labelText = navSection.innerText.split('\n')[0].trim();
      const labelWrapper = document.createElement('button');
      labelWrapper.classList.add('nav-label-wrapper');
      const label = document.createElement('p');
      label.innerText = labelText;
      labelWrapper.append(label);
      // mobile sections chevrons
      const chevron = document.createElement('div');
      chevron.classList.add('nav-chevron');
      chevron.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><mask id="mask0_11776_23524" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><rect y="24" width="24" height="24" transform="rotate(-90 0 24)" fill="#D9D9D9"/></mask><g mask="url(#mask0_11776_23524)"><path d="M15.0537 12.0005L9.39994 17.6543L8.34619 16.6005L12.9462 12.0005L8.34619 7.40055L9.39994 6.3468L15.0537 12.0005Z" fill="white"/></g></svg>';

      labelWrapper.addEventListener('click', () => {
        toggleDropdown(navSection);
      });

      labelWrapper.append(chevron);

      // Navigation dropdown menu
      const dropdown = document.createElement('div');
      dropdown.classList.add('nav-drop-menu');
      const [navDropdown] = navSection.children;
      if (navDropdown) {
        const [navDropdownHighlights, navDropdownFeatures] = navDropdown.children;

        // Dropdown left section
        if (navDropdownHighlights) {
          const highlightSection = document.createElement('div');
          highlightSection.classList.add('nav-highlights');
          const highlightBlocks = navDropdownHighlights.querySelectorAll(':scope > ul > li');
          highlightBlocks.forEach((highlight) => {
            const titleWrapper = document.createElement('a');
            titleWrapper.href = highlight.querySelector('a').getAttribute('href');
            const title = document.createElement('h6');
            title.innerText = highlight.querySelector('a').innerText;
            titleWrapper.append(title);
            if (highlight.querySelector('ul > li')) {
              const description = document.createElement('p');
              description.innerText = highlight.querySelector('ul > li').innerText.trim();
              preventHyphenBreaks(description);
              titleWrapper.append(description);
            }
            highlightSection.append(titleWrapper);
          });
          dropdown.append(highlightSection);
        }

        // Dropdown right section
        if (navDropdownFeatures) {
          const featureSection = document.createElement('div');
          featureSection.classList.add('nav-features');

          // embed fragment to 'Insikt Group® Research' dropdown
          if (labelText === 'Insikt Group® Research' && navFragment) {
            navSections.removeChild(navFragment);
            featureSection.append(navFragment);
          } else {
            const featureSectionBlocks = navDropdownFeatures.querySelectorAll(':scope > ul > li');
            featureSectionBlocks.forEach((feature) => {
              const featureSectionBlock = document.createElement('div');
              const featuresBlockDesc = document.createElement('p');
              featuresBlockDesc.classList.add('nav-feature-description');
              featuresBlockDesc.innerText = feature.innerText.split('\n')[0].trim();
              preventHyphenBreaks(featuresBlockDesc);
              featureSectionBlock.append(featuresBlockDesc);
              const blockTitles = feature.querySelectorAll(':scope > ul > li');
              blockTitles.forEach((title) => {
                const titleLogo = title.querySelector('a:has(span.icon)') || title.querySelector('span.icon');
                const isLogoFirst = title.firstElementChild === titleLogo;

                const blockTitleWrapper = document.createElement('a');
                blockTitleWrapper.href = title.querySelector('a').getAttribute('href');
                blockTitleWrapper.classList.add('nav-feature');
                const textWrapper = document.createElement('div');
                const blockTitle = document.createElement('h6');
                blockTitle.innerText = title.querySelector('a').innerText;
                textWrapper.append(blockTitle);

                if (title.querySelector('ul > li')) {
                  const description = document.createElement('p');
                  description.innerText = title.querySelector('ul > li').innerText.trim();
                  preventHyphenBreaks(description);
                  textWrapper.append(description);
                }

                blockTitleWrapper.append(textWrapper);

                if (titleLogo) {
                  const titleImg = titleLogo.querySelector('img');
                  if (titleImg) {
                    titleImg.setAttribute('alt', `Link to ${blockTitle.textContent}`);
                  }

                  isLogoFirst ? blockTitleWrapper.prepend(titleLogo) : blockTitleWrapper.append(titleLogo);
                }

                featureSectionBlock.append(blockTitleWrapper);
              });
              featureSection.append(featureSectionBlock);
            });
          }
          dropdown.append(featureSection);
        }

        navSection.innerHTML = '';
        navSection.append(labelWrapper, dropdown);
      }
    });
  }

  // search
  const navSearch = nav.querySelector('.nav-search');
  if (navSearch) {
    const searchIcon = navSearch.querySelector('[data-icon-name="search"]');

    const searchTriggerButton = document.createElement('button');
    searchTriggerButton.classList.add(`button-search`);
    const chevron = document.createElement('div');
    chevron.classList.add('nav-chevron');
    chevron.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><mask id="mask0_11776_23524" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><rect y="24" width="24" height="24" transform="rotate(-90 0 24)" fill="#D9D9D9"/></mask><g mask="url(#mask0_11776_23524)"><path d="M15.0537 12.0005L9.39994 17.6543L8.34619 16.6005L12.9462 12.0005L8.34619 7.40055L9.39994 6.3468L15.0537 12.0005Z" fill="white"/></g></svg>';
    chevron.setAttribute('role', 'button');
    chevron.addEventListener('click', () => {
      const expanded = navSection.getAttribute('aria-expanded') === 'true';
      navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
    searchTriggerButton.append(chevron);
    searchTriggerButton.setAttribute('type', 'button');
    searchTriggerButton.setAttribute('aria-label', 'search button');
    searchTriggerButton.append(searchIcon);

    const searchInputWrapper = document.createElement('div');
    searchInputWrapper.classList.add('nav-search-wrapper');
    searchInputWrapper.innerHTML = `
<div class="nav-containers">
  <div class="nav-search-container">
    <label class="nav-search-label" for="search-input">Search for...</label>
    <div class="nav-search-input">
      <input
        type="text"
        id="search-input"
        placeholder="Begin your search!"
        aria-label="Search form"
        name="search"
        aria-placeholder="Begin your search!"
        aria-describedby="search-description"
      />
      <div class="nav-button-wrapper">
        <button class="nav-search-button" aria-label="Submit search">
          <span></span>
        </button>
      </div>
    </div>
  </div>
</div>`;

    searchTriggerButton.addEventListener('click', () => {
      toggleDropdown(searchInputWrapper);
    });

    const searchWrapper = navSearch.querySelector('.default-content-wrapper');
    searchWrapper.innerHTML = '';
    searchWrapper.append(searchTriggerButton, searchInputWrapper);

    const searchButton = searchInputWrapper.querySelector('.nav-button-wrapper');
    if (searchButton) {
      searchButton.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleSearchSubmit();
      });
    }
    const searchInput = navSearch.querySelector('#search-input');
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          handleSearchSubmit();
        }
      });
    }
  }

  // locales
  const navLocales = nav.querySelector('.nav-locales');
  const localesWrapper = navLocales.querySelector('.default-content-wrapper');

  const translateIcon = localesWrapper.querySelector('[data-icon-name]');

  const chevron = document.createElement('div');
  chevron.classList.add('nav-chevron');
  chevron.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><mask id="mask0_11776_23524" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><rect y="24" width="24" height="24" transform="rotate(-90 0 24)" fill="#D9D9D9"/></mask><g mask="url(#mask0_11776_23524)"><path d="M15.0537 12.0005L9.39994 17.6543L8.34619 16.6005L12.9462 12.0005L8.34619 7.40055L9.39994 6.3468L15.0537 12.0005Z" fill="white"/></g></svg>';

  const translateButton = document.createElement('button');
  translateButton.classList.add(`button-translate`);
  translateButton.setAttribute('type', 'button');
  translateButton.setAttribute('aria-label', 'translate button');
  translateButton.append(chevron, translateIcon);
  const translateBlock = navLocales.querySelector('.locales-wrapper');

  translateButton.addEventListener('click', () => {
    toggleDropdown(translateBlock);
  });

  localesWrapper.innerHTML = '';
  localesWrapper.append(translateButton, translateBlock);

  // tools
  const navCta = nav.querySelector('.nav-cta');
  const navTools = document.createElement('div');
  navTools.classList.add('nav-tools');

  const searchLocalesWrapper = document.createElement('div');
  searchLocalesWrapper.classList.add('search-locales-wrapper');
  searchLocalesWrapper.append(navSearch, navLocales);
  navTools.append(searchLocalesWrapper, navCta);
  nav.append(navTools);

  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, navSections, false);
    toggleAllNavSections(navSections, false);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  window.addEventListener('keydown', closeOnEscape);
  window.addEventListener('focusout', (e) => closeOnFocusLost(e, nav));
}
