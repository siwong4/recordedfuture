import { algoliasearch } from 'https://cdn.jsdelivr.net/npm/algoliasearch@5.20.1/+esm';
import { getAlgoliaConfig, formatDate, fetchSvg } from '../../utils/helper.js';
import { getMetadata, fetchPlaceholders } from '../../scripts/aem.js';
import { createPageButton, createPagination, cardsPerPage, buildAccordionMenu } from './helper.js';

const { baseurl: BASE_URL } = await fetchPlaceholders();
// const { testurl: TEST_URL } = await fetchPlaceholders();
let algoliaClient = null;
let selectedFilters = [];
let resourceType = '';
let requestIndexName = '';
let filterTags = [];

const createSection = (classNames, innerHTML = '') => {
  const section = document.createElement('div');
  section.classList.add('section', ...classNames);
  section.innerHTML = innerHTML;
  return section;
};

const resetFiltersCount = (buttonLabels) => {
  buttonLabels.forEach((label) => {
    const resetLabel = label.textContent.replace(/\s*\(\s*\d+\s*\)\s*$/, '');
    label.textContent = resetLabel;
  });
};

const updateFilterPills = async (menu, buttonLabels, cardContainer, forceUpdate = false) => {
  const pillContainer = main.querySelector('.pills-container');
  const currentTags = selectedFilters.map((filter) => filter.value.split(':')[1]);
  const checkboxes = menu.querySelectorAll('input[type=checkbox]');

  const isExpanded = pillContainer.querySelector('.show-less-pill') !== null;

  pillContainer.classList.toggle('no-filter', currentTags.length === 0);

  const existingPills = pillContainer.querySelectorAll('.pill:not(.overflow-pill):not(.show-less-pill)');
  const existingTagSet = new Set();
  existingPills.forEach((pill) => {
    const tag = pill.textContent.trim();
    if (forceUpdate || !currentTags.includes(tag)) {
      pill.remove();
    } else {
      existingTagSet.add(tag);
    }
  });

  pillContainer.querySelector('.overflow-pill')?.remove();
  pillContainer.querySelector('.show-less-pill')?.remove();

  let existingClearAll = pillContainer.querySelector('.clear-all-link');
  if (currentTags.length > 0) {
    if (!existingClearAll) {
      const clearLink = document.createElement('button');
      clearLink.className = 'clear-all-link';
      clearLink.textContent = 'Clear all';
      clearLink.type = 'button';

      clearLink.addEventListener('click', async () => {
        selectedFilters.length = 0;
        checkboxes.forEach((checkbox) => (checkbox.checked = false));
        await updateFilterPills(menu, buttonLabels, cardContainer);
        resetFiltersCount(buttonLabels);
        loadCards(0, cardContainer);
      });

      pillContainer.appendChild(clearLink);
      existingClearAll = clearLink;
    }
  } else if (existingClearAll) {
    existingClearAll.remove();
  }

  const overflowPills = [];
  let overflowCount = 0;

  pillContainer.style.maxHeight = 'calc(52px * 2 + var(--space-5))';

  for (const tag of currentTags) {
    if (existingTagSet.has(tag)) continue;

    const exists = [...pillContainer.querySelectorAll('.pill')].some((p) => p.textContent === tag);
    if (!exists) {
      const closeButton = await fetchSvg('close');

      const pill = document.createElement('span');
      pill.classList.add('pill');
      pill.textContent = tag;

      const iconWrapper = document.createElement('span');
      iconWrapper.classList.add('remove-wrapper');
      iconWrapper.innerHTML = closeButton;

      iconWrapper.addEventListener('click', () => {
        pill.remove();
        const index = selectedFilters.findIndex((filter) => filter.value.split(':')[1] === tag);
        let targetFilter;
        if (index !== -1) targetFilter = selectedFilters.splice(index, 1);
        [...checkboxes].find((checkbox) => checkbox.name === pill.textContent.trim()).checked = false;
        updateMenuItems(selectedFilters, targetFilter?.[0].filter, menu, cardContainer);
        loadCards(0, cardContainer);
      });

      pill.appendChild(iconWrapper);
      pillContainer.insertBefore(pill, existingClearAll || null);

      const willOverflow = pillContainer.scrollHeight > pillContainer.clientHeight;
      if (willOverflow) {
        pill.remove();
        overflowPills.push(pill);
        overflowCount++;
      }
    }
  }

  if (isExpanded) {
    pillContainer.style.maxHeight = 'none';

    overflowPills.forEach((pill) => pillContainer.insertBefore(pill, existingClearAll || null));

    const showLessPill = document.createElement('span');
    showLessPill.className = 'pill show-less-pill';
    showLessPill.textContent = 'Show less';
    showLessPill.addEventListener('click', () => {
      pillContainer.style.maxHeight = 'calc(52px * 2 + var(--space-5))';
      showLessPill.remove();

      updateFilterPills(menu, buttonLabels, cardContainer, true);
    });

    pillContainer.insertBefore(showLessPill, existingClearAll || null);
    return;
  }

  const createTogglePill = (text, className, clickHandler) => {
    const pill = document.createElement('span');
    pill.className = `pill ${className}`;
    pill.textContent = text;
    pill.addEventListener('click', clickHandler);
    return pill;
  };

  if (overflowCount > 0) {
    const overflowPill = createTogglePill(`+${overflowCount}`, 'overflow-pill', () => {
      overflowPills.forEach((pill) => pillContainer.insertBefore(pill, existingClearAll || null));
      overflowPill.remove();

      pillContainer.style.maxHeight = 'none';

      const showLessPill = createTogglePill('Show less', 'show-less-pill', () => {
        overflowPills.forEach((pill) => pill.remove());
        pillContainer.style.maxHeight = 'calc(52px * 2 + var(--space-5))';
        showLessPill.remove();
        pillContainer.insertBefore(overflowPill, existingClearAll || null);
      });

      pillContainer.insertBefore(showLessPill, existingClearAll || null);
    });

    pillContainer.insertBefore(overflowPill, existingClearAll || null);

    let pills = Array.from(pillContainer.querySelectorAll('.pill:not(.overflow-pill):not(.show-less-pill)'));
    while (pillContainer.scrollHeight > pillContainer.clientHeight && pills.length > 0) {
      const lastPill = pills.pop();
      lastPill.remove();
      overflowPills.unshift(lastPill);
      overflowCount++;
      overflowPill.textContent = `+${overflowCount}`;
    }
  }
};

const attachResizeListener = (main, cardContainer, delay = 100) => {
  let timeoutId;
  let lastWidth = window.innerWidth;

  const onResize = () => {
    if (window.innerWidth === lastWidth) return;

    lastWidth = window.innerWidth;
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      const menu =
        window.innerWidth > 1024
          ? main.querySelector('.articles-filter-wrapper > .filter-menu')
          : main.querySelector('.filter-overlay > .overlay-wrapper');
      updateMenuItems(selectedFilters, null, menu, cardContainer, true);
    }, delay);
  };

  window.addEventListener('resize', onResize);

  return () => {
    window.removeEventListener('resize', onResize);
    clearTimeout(timeoutId);
  };
};

const updateMenuItems = async (selectedFilters, category, menu, cardContainer, forceUpdate = false) => {
  const buttonLabels = menu.querySelectorAll('.title-button-label');

  const updateLabel = (element) => {
    const [label, cat] = element.id.split('-');
    const count = selectedFilters.filter((item) => item.filter === cat).length;
    element.innerText = count > 0 ? `${label} ( ${count} )` : label;
  };

  if (category) {
    for (const element of buttonLabels) {
      if (element.id.split('-')[1] === category) {
        updateLabel(element);
        break;
      }
    }
  } else {
    const filterItems = menu.querySelectorAll('.filter-items > li');
    for (const element of buttonLabels) {
      updateLabel(element);
    }

    const selectedValues = new Set(selectedFilters.map((filter) => filter.value));

    if (filterItems.length) {
      filterItems.forEach((item) => {
        const input = item.querySelector('input[type="checkbox"]');
        if (!input) return;

        input.checked = selectedValues.has(input.value);
      });
    }
  }

  await updateFilterPills(menu, buttonLabels, cardContainer, forceUpdate);
  loadCards(0, cardContainer);
};

const createFilterOverlay = async (data) => {
  const closeButton = await fetchSvg('close');
  const overlay = document.createElement('div');
  overlay.classList.add('filter-overlay');
  overlay.style.display = 'none';

  const overlayWrapper = document.createElement('div');
  overlayWrapper.classList.add('overlay-wrapper');

  const filterTitle = document.createElement('span');
  filterTitle.classList.add('filter-title');
  const filterTextNode = document.createTextNode('Filter');
  filterTitle.appendChild(filterTextNode);

  const iconWrapper = document.createElement('span');
  iconWrapper.innerHTML = closeButton;
  iconWrapper.addEventListener('click', () => {
    overlay.classList.remove('fade-in');
    overlay.classList.add('fade-out');
    document.body.style.overflow = '';

    setTimeout(() => {
      overlay.style.display = 'none';
    }, 600);
  });

  const buttonWrapper = document.createElement('div');
  buttonWrapper.classList.add('button-wrapper');
  const resourcesButton = document.createElement('button');
  resourcesButton.classList.add('view-resources-btn', 'secondary');
  resourcesButton.innerText = 'View Resources';
  resourcesButton.addEventListener('click', () => {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  });
  buttonWrapper.appendChild(resourcesButton);

  filterTitle.appendChild(iconWrapper);
  overlayWrapper.append(filterTitle, await buildAccordionMenu(data), buttonWrapper);

  overlay.append(overlayWrapper);

  return overlay;
};

const createFilterMenu = async (main, filterOverlay, data, cardContainer) => {
  const menuTitle = getMetadata('menu-title');

  const menu = document.createElement('div');
  menu.classList.add('filter-menu');

  const titleHeader = document.createElement('h4');
  titleHeader.classList.add('title');
  titleHeader.innerText = menuTitle;
  menu.append(titleHeader);

  const mobileDropdownContainer = document.createElement('div');
  mobileDropdownContainer.classList.add('filter-dropdown-wrapper');
  mobileDropdownContainer.addEventListener('click', () => {
    filterOverlay.style.display = 'flex';
    filterOverlay.classList.remove('fade-out');
    void filterOverlay.offsetWidth;
    filterOverlay.classList.add('fade-in');
    document.body.style.overflow = 'hidden';
  });

  const dropdownIcon = await fetchSvg('chevron_down');

  const filterTitle = document.createElement('span');
  filterTitle.classList.add('filter-title');
  const filterTextNode = document.createTextNode('Filter');
  filterTitle.appendChild(filterTextNode);

  const iconWrapper = document.createElement('span');
  iconWrapper.innerHTML = dropdownIcon;

  filterTitle.appendChild(iconWrapper);

  mobileDropdownContainer.append(filterTitle);

  // menu options
  menu.append(await buildAccordionMenu(data), mobileDropdownContainer);

  data.forEach((item) => {
    filterTags.push(item.filter);
  });

  // add checkbox event listener
  const checkboxes = [menu, filterOverlay].reduce((acc, el) => {
    return acc.concat(Array.from(el.querySelectorAll('input[type="checkbox"]')));
  }, []);

  const toggleCheckbox = (item) => {
    const value = item.value.trim();
    const category = item.value.split(':')[0];
    const isDesktop = window.innerWidth > 1024;

    if (item.checked) {
      // add to filter list
      selectedFilters.push({ filter: category, value: value });
      updateMenuItems(selectedFilters, category, isDesktop ? menu : filterOverlay, cardContainer);
    } else {
      // remove from filter list
      selectedFilters = selectedFilters.filter((e) => e.value !== value);
      updateMenuItems(selectedFilters, category, isDesktop ? menu : filterOverlay, cardContainer);
    }
  };

  [...checkboxes].forEach((checkbox) => {
    checkbox.addEventListener('keydown', async function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.checked = !this.checked;
        toggleCheckbox(this);
      }
    });

    checkbox.addEventListener('change', async function (e) {
      e.preventDefault();
      toggleCheckbox(this);
    });
  });

  attachResizeListener(main, cardContainer);

  return menu;
};

const createCard = (hit) => {
  const card = {
    thumbnail: hit.thumb || hit.image || '/assets/card-placeholder.png',
    title: hit.title || 'Untitled',
    description: hit.excerpt || '',
    date: hit.publishedDate || '',
    author: Array.isArray(hit.author) ? hit.author.join(', ').toUpperCase() : '',
  };

  let cardLink = null;
  if (hit.slug) {
    cardLink = `${BASE_URL}${hit.slug}`;
  } else if (hit.extUrl) {
    cardLink = hit.extUrl;
  }

  const anchorWrapper = document.createElement('a');
  anchorWrapper.href = cardLink;
  anchorWrapper.classList.add('card-wrapper');
  anchorWrapper.setAttribute('aria-label', `Go to ${card.title}`);
  anchorWrapper.setAttribute('role', 'link');
  if (cardLink === hit.extUrl) {
    anchorWrapper.setAttribute('target', '_blank');
    anchorWrapper.setAttribute('rel', 'noopener noreferrer');
  }

  let dateAndAuthor = '';
  if (card.date) {
    dateAndAuthor += formatDate(card.date);
  }
  if (card.author) {
    if (dateAndAuthor) {
      dateAndAuthor += ' • ';
    }
    dateAndAuthor += card.author;
  }

  const containerWrapper = document.createElement('div');
  containerWrapper.classList.add('card-content');
  containerWrapper.innerHTML = `<div class='thumbnail'>
                            <img 
                              src="${card.thumbnail}" 
                              alt="${card.title || ''}" 
                              onerror="this.onerror=null; 
                              this.src='/assets/card-placeholder.png';"
                             >
                            </div>
                            <div class='cards-data'>
                              <p class='author-date'>${dateAndAuthor}</p>
                              <h3 class='title'>${card.title || 'Untitled'}</h3>
                              <p class='description'>${card.description}</p>
                            </div>`;

  anchorWrapper.append(containerWrapper);

  const cardWrapper = document.createElement('div');
  cardWrapper.append(anchorWrapper);

  return cardWrapper.innerHTML;
};

const loadCards = async (pageIndex, container) => {
  try {
    let cardsGrid = container.querySelector('.cards-grid');
    if (cardsGrid) {
      cardsGrid.innerHTML = '<div class="loading">Loading articles...</div>';
    } else {
      cardsGrid = document.createElement('div');
      cardsGrid.classList.add('cards-grid');
      cardsGrid.innerHTML = '<div class="loading">Loading articles...</div>';
      container.append(cardsGrid);
    }

    /*
       Group facetFilters -  "threatTags", "industryTags", "topicTags"
     */

    let facetFiltersParams = '';
    filterTags.forEach((filter, i) => {
      const tagValues = selectedFilters.filter((item) => item.filter === filter).map((a) => a.value);
      if (tagValues.length > 0) {
        const tagsText = tagValues.map((item) => `"${item}"`).join(',');

        if (facetFiltersParams.length > 0) {
          facetFiltersParams += ',';
        }
        facetFiltersParams += '[' + tagsText + ']';
      }
    });

    const request = {
      indexName: requestIndexName,
      hitsPerPage: cardsPerPage,
      page: pageIndex,
      filters: `resourceType:${resourceType}`,
      // filters: `newsResourceType:${resourceType}`,
      facetFilters: `[${facetFiltersParams}]`,

      //facetFilters: [['topicTags:Vulnerability Intelligence', 'topicTags:Brand Intelligence'], ['industryTags:Identity Intelligence'], ['threatTags:Fraud Intelligence']],
      //filters: "newsResourceType:${resourceType} AND (topicTags:'Brand Intelligence')",
    };

    const { results } = await algoliaClient.search([request]);

    const hits = results[0].hits;
    const totalHits = results[0].nbHits;
    const totalPages = results[0].nbPages;

    cardsGrid.innerHTML = '';
    if (hits.length > 0) {
      cardsGrid.innerHTML = hits.map(createCard).join('');
    } else {
      cardsGrid.innerHTML = '<div class="no-results"><h3>No articles found</h3></div>';
    }

    const existingPagination = container.querySelector('.pagination-bar');
    if (existingPagination) existingPagination.remove();

    if (hits.length > 0) {
      container.append(createPagination(pageIndex, totalHits, totalPages, loadCards, container));
    }

    if (hits.length < cardsPerPage) {
      if (hits.length <= 2) {
        cardsGrid.classList.add('one-row');
      } else if (hits.length <= 4) {
        cardsGrid.classList.add('two-row');
      }
    }
  } catch (error) {
    console.error('Error loading articles:', error);
    const cardsGrid = container.querySelector('.cards-grid');
    if (cardsGrid) {
      cardsGrid.innerHTML = `
        <div class="error-message">
          <h3>Sorry, we encountered an error loading the articles</h3>
          <p>Please try again later.</p>
        </div>
      `;
    }
  }
};

export async function loadLazy(main) {
  resourceType = getMetadata('resource-type');

  const articlesFilterContainer = createSection(['articles-filter-container']);
  const articlesFilterWrapper = document.createElement('div');
  articlesFilterWrapper.classList.add('articles-filter-wrapper');
  articlesFilterContainer.append(articlesFilterWrapper);

  const cardsContainer = document.createElement('div');
  cardsContainer.classList.add('cards-container');

  let filterOverlay = null;

  try {
    // get filters and built menu
    const filterHref = getMetadata('filter');
    const resp = await fetch(filterHref);
    const { data } = await resp.json();
    filterOverlay = await createFilterOverlay(data);
    const filterMenu = await createFilterMenu(main, filterOverlay, data, cardsContainer);

    // setup Aloglia
    // const { appid, apikey, resourceindexdate } = await getAlgoliaConfig();
    const { appid, apikey, testedsindex } = await getAlgoliaConfig();
    algoliaClient = algoliasearch(appid, apikey);
    // requestIndexName = resourceindexdate;
    requestIndexName = testedsindex;

    // build content - pills and cards
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('articles-content-wrapper');

    const pillsWrapper = document.createElement('div');
    pillsWrapper.classList.add('pills-container');
    if (selectedFilters.length === 0) {
      pillsWrapper.classList.add('no-filter');
    }

    contentWrapper.append(pillsWrapper, cardsContainer);

    articlesFilterWrapper.append(filterMenu, contentWrapper);

    loadCards(0, cardsContainer);
  } catch (error) {
    console.error('Error initializing articles:', error);
    articlesFilterWrapper.innerHTML = `
     <div class="error-message">
        <h3>Sorry, we encountered an error loading articles</h3>
        <p>Please try again later.</p>
    </div>`;
  }

  const heroContainer = main.querySelector('.hero-header-container');
  const featuredContainer = main.querySelector('.feature-2x-container');
  const ctaContainer = main.querySelector('.cta-container');

  main.innerHTML = '';

  if (filterOverlay) {
    main.append(filterOverlay);
  }

  if (heroContainer) {
    main.append(heroContainer);
  }
  if (featuredContainer) {
    main.append(featuredContainer);
  }

  main.append(articlesFilterContainer);

  if (ctaContainer) {
    main.append(ctaContainer);
  }
  main.classList.add('articles-page');
}
