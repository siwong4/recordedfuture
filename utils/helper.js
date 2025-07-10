import { fetchPlaceholders } from '../scripts/aem.js';

/**
 * To fetch svg
 * @param {String} iconName svg file name
 * @param {String} path svg file path
 */
async function fetchSvg(iconName, path) {
  try {
    const iconPath = path ? `${path}/${iconName}` : `/icons/${iconName}`;
    const response = await fetch(`${window.hlx.codeBasePath}${iconPath}.svg`);
    if (response.ok) {
      const svg = await response.text();
      return svg;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
  return null;
}

/**
 * touch swipe Left Right action
 * @param {Element} container The container to detect swipe
 * @param {Function} swipeListener
 */

const LEFT = 'left';
const RIGHT = 'right';

export const SWIPE_DIRECTION = {
  LEFT,
  RIGHT,
};

function swipeLeftRight(container, swipeListener) {
  let xDown;
  let xUp;
  let yDown;
  let yUp;

  container.addEventListener(
    'touchstart',
    (e) => {
      xDown = e.touches[0].clientX;
      yDown = e.touches[0].clientY;
    },
    { passive: true }
  );

  container.addEventListener('touchmove', (e) => {
    if (xDown) {
      xUp = e.touches[0].clientX;
      yUp = e.touches[0].clientY;
      const xDiff = xDown - xUp;
      const yDiff = yDown - yUp;
      if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
          e.preventDefault();
          swipeListener(SWIPE_DIRECTION.RIGHT);
        } else if (xDiff < 0) {
          e.preventDefault();
          swipeListener(SWIPE_DIRECTION.LEFT);
        }
        xDown = null;
      }
    }
  });
}

function formatDate(inputDate) {
  let date;

  if (/^\d+$/.test(inputDate)) {
    date = new Date(Number(inputDate));
  } else {
    date = new Date(inputDate);
  }

  if (isNaN(date)) {
    throw new Error('Invalid date format');
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const [month, day, year] = formatter.format(date).replace(/,/g, '').split(' ');
  return `${day} ${month} ${year}`;
}

/**
 * create a card item
 * @param {Element} item
 * @param {String} linkIcon // svg element as string
 */

async function createCardItem(item, linkIcon) {
  const cardItem = document.createElement('div');
  cardItem.className = 'card-item';
  const icon = item.icon ? await fetchSvg(item.icon) : null;
  cardItem.innerHTML = `<div class='card-header'>${icon ? icon : ''}
                      <h2 class='item-title'>${item.title}</h2></div>
                      <p class='item-description'>${item.description}</p>
                      ${item.link && `<a href='${item.link}' aria-label='link to ${item.title}' class='item-link'>${linkIcon}</a>`}`;
  return cardItem;
}

/**
 * create a card item
 * @param {Element} row
 * @param {Number} orderNum
 * @param {String} linkIcon // svg element as string
 */

function createOrderedCardItem(row, orderNum, linkIcon) {
  const [title, description, buttonContainer] = [...row.children];
  const link = buttonContainer.querySelector('a');
  const cardItem = document.createElement('div');
  cardItem.className = 'card-item';
  cardItem.innerHTML = `<div class='card-header'>
                          <p class='item-num'>${orderNum}</p>
                          <h2 class='item-title'>${title.textContent}</h2></div>
                          <p class='item-description'>${description.textContent}</p>
                          <a href='${link.href}' class='item-link'>${link.textContent}${linkIcon}</a>`;

  return cardItem;
}

/**
 * handle search submission
 * @param {HTMLElement} button - the button element to attach the event
 * @param {HTMLElement} inputElement - the input element
 */

function handleSearchSubmit(button, inputElement) {
  if (!inputElement) {
    console.error('Search input element not found!');
    return;
  }

  button.addEventListener('click', () => {
    const query = sanitizeInput(inputElement.value.trim());
    if (query !== '') {
      const url = `/search?query=${encodeURIComponent(query)}`;
      window.location.href = url;
    } else {
      // eslint-disable-next-line no-console
      console.log('Query is empty, not navigating');
    }
  });
}

/**
 * fetches and returns Algolia configuration from placeholders
 * @returns {Promise<Object>} Aagolia configuration object
 */

async function getAlgoliaConfig() {
  const placeholders = await fetchPlaceholders();
  const { appid, apikey, primaryindex, resourceindex, cveindex, resourceindexdate, casestudiesindex, testedsindex } =
    placeholders;

  return { appid, apikey, primaryindex, resourceindex, cveindex, resourceindexdate, casestudiesindex, testedsindex };
}

/**
 * extracts and returns the search term from the current URL query parameters
 * @returns {string} search term from URL parameters
 */

function getSearchTerm() {
  const params = new URLSearchParams(window.location.search);
  return encodeHTMLEntities(sanitizeInput(String(params.get('query') || ''))).trim();
}

/**
 * Group all buttons under the div into button groups for styling
 * @param {HTMLElement} block - element to build button group
 * @param {string} buttonGroupName - group name
 * @param {boolean} isDarkMode - dark mode indicator
 * @returns {HTMLElement} - button group div
 */
function buildButtonGroup(block, buttonGroupName, isDarkMode = false) {
  const buttonGroup = document.createElement('div');
  buttonGroup.classList.add(buttonGroupName);

  const buttons = block.querySelectorAll('.button-container');
  [...buttons].forEach((element) => {
    const buttonContainer = element.cloneNode(true);

    if (isDarkMode) {
      const buttonLinks = buttonContainer.getElementsByTagName('a');
      [...buttonLinks].forEach((buttonLink) => {
        buttonLink.classList.add('dark');
      });
    }

    buttonGroup.appendChild(buttonContainer);
    element.remove();
  });
  return buttons?.length > 0 ? buttonGroup : null;
}

/**
 * Create carousel actions
 * @param {HTMLCollection | NodeList} cards list of items in the carousel
 * @param {HTMLElement} carouselContainer carousel element
 * @param {Number} direction -1 - move left / 0 - in-place / 1 - move right
 * @param {Number} targetIndex index to move to (default = null for left/right)
 */

function handleCarouselAction(cards, carouselContainer, direction, targetIndex = null) {
  const itemCount = cards.length;

  const indicators = [...carouselContainer.querySelectorAll('.indicators li')];

  const mod = (n, m) => {
    return ((n % m) + m) % m;
  };

  let currentActiveIndex = 0;
  for (let i = 0; i < itemCount; i += 1) {
    if (cards[i].classList.contains('active')) {
      currentActiveIndex = i;
      break;
    }
  }

  cards[currentActiveIndex].classList.remove('active');
  indicators[currentActiveIndex].classList.remove('active');

  // TEMP: disable infinite scrolling until ready HERMES-452
  const nextActiveIndex =
    currentActiveIndex + direction >= itemCount || currentActiveIndex + direction < 0
      ? currentActiveIndex
      : currentActiveIndex + direction;

  // let nextActive = targetIndex !== null ? targetIndex : mod(currentActiveIndex + direction, itemCount);
  let nextActive = targetIndex !== null ? targetIndex : nextActiveIndex;
  // end TEMP

  if (!cards[nextActive] || !indicators[nextActive]) {
    nextActive = 0;
  }

  cards[nextActive].classList.add('active');
  indicators[nextActive].classList.add('active');

  const container = cards[nextActive].parentElement;
  const scrollLeft = cards[nextActive].offsetLeft - (container.clientWidth - cards[nextActive].clientWidth) / 2;

  container.scrollTo({
    left: scrollLeft,
    behavior: 'smooth',
  });

  const prevButton = carouselContainer.querySelector('.previous');
  const nextButton = carouselContainer.querySelector('.next');

  if (nextActive === 0) {
    prevButton.disabled = true;
  } else {
    prevButton.disabled = false;
  }

  if (nextActive === itemCount - 1) {
    nextButton.disabled = true;
  } else {
    nextButton.disabled = false;
  }
}

/**
 * Create carousel navigation bar
 * @param {HTMLCollection | NodeList} cards list of items in the carousel
 * @param {Function} slideAction slide movement
 */

function createCarouselNavigation(cards, slideAction) {
  const carouselContainer = document.createElement('div');
  carouselContainer.classList.add('pagination');

  const carouselActions = document.createElement('div');
  carouselActions.classList.add('carousel-actions');

  const createCarouselButton = (className, ariaLabel, iconClass, clickHandler) => {
    const buttonWrapper = document.createElement('div');
    buttonWrapper.classList.add(`${className}-wrapper`);
    const button = document.createElement('button');
    button.classList.add(className);
    button.setAttribute('aria-label', ariaLabel);
    button.setAttribute('type', 'button');
    button.innerHTML = `<span class="${iconClass}"></span>`;

    clickHandler && button.addEventListener('click', clickHandler);
    buttonWrapper.appendChild(button);
    return buttonWrapper;
  };

  const createCarouselIndicators = () => {
    const indicatorContainer = document.createElement('ol');
    indicatorContainer.classList.add('indicators');

    for (let i = 0; i < cards.length; i++) {
      const li = document.createElement('li');
      const button = document.createElement('button');

      button.setAttribute('type', 'button');
      button.setAttribute('aria-label', `Slide ${i + 1}`);
      button.classList.add('dot');
      if (i === 0) {
        li.classList.add('active');
      }

      if (slideAction) {
        button.addEventListener('click', () => {
          slideAction(cards, carouselContainer, 0, i);
        });
      }

      li.appendChild(button);
      indicatorContainer.appendChild(li);
    }
    return indicatorContainer;
  };

  const prevWrapper = createCarouselButton(
    'previous',
    'Previous',
    'previous-icon',
    slideAction ? () => slideAction(cards, carouselContainer, -1) : undefined
  );

  const nextWrapper = createCarouselButton(
    'next',
    'Next',
    'next-icon',
    slideAction ? () => slideAction(cards, carouselContainer, 1) : undefined
  );

  const indicators = createCarouselIndicators();

  carouselActions.append(prevWrapper, indicators, nextWrapper);
  carouselContainer.append(carouselActions);

  const prevButton = prevWrapper.querySelector('button');
  const nextButton = nextWrapper.querySelector('button');

  if (prevButton) prevButton.disabled = true;
  if (nextButton) nextButton.disabled = cards.length <= 1;

  return carouselContainer;
}

/** Converts hex code with optional opacity to rgba
 * @param {String} hex
 * @returns {String} rgb
 */
function hexToRGB(hex) {
  const parsedHex = hex.replace(/^#/, '');
  let bigint = parseInt(parsedHex, 16);
  return `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`;
}

/**
 * Applies background styling to a section based on its section metadata -- style
 * @param {HTMLElement} section the section from which its metadata is reading from
 */
function applyBackgroundStylesFromMetadata(main) {
  const sections = main.querySelectorAll('.section');
  if (!sections.length) return;

  sections.forEach((section) => {
    const classList = [...section.classList];
    const bgClasses = classList.filter((cls) => cls.startsWith('bg-'));

    if (!bgClasses.length) return;

    const computedStyle = getComputedStyle(document.documentElement);

    const opacityClass = bgClasses.find((cls) => cls.startsWith('bg-opacity-'));
    const bgColorClass = bgClasses.find((cls) => cls.startsWith('bg-color-'));
    const szCornerClass = bgClasses.filter((cls) => cls.startsWith('bg-sz-radius-'));
    const rdCornerClasses = bgClasses.filter((cls) => cls.startsWith('bg-rd-radius'));

    if (bgColorClass) {
      const colorVar = `--${bgColorClass.replace('bg', 'background')}`;
      const hexColor = computedStyle.getPropertyValue(colorVar).trim();

      if (hexColor) {
        let opacity = 1;
        if (opacityClass) {
          opacity = parseFloat(opacityClass.replace('bg-opacity-', '')) / 100;
        }
        section.style.backgroundColor = `rgba(${hexToRGB(hexColor)}, ${opacity})`;
      }
    }

    if (rdCornerClasses.length > 0) {
      const sizeOverride = szCornerClass.length ? szCornerClass?.[0].match(/-([a-z]+)$/)?.[1] : null;
      const radiusVar = sizeOverride
        ? `--corner-${sizeOverride}`
        : window.innerWidth < 600
          ? '--corner-sm'
          : '--corner-lg';
      const borderRadius = computedStyle.getPropertyValue(radiusVar).trim();

      if (borderRadius) {
        const corners = { tl: '0', tr: '0', br: '0', bl: '0' };

        rdCornerClasses.forEach((cls) => {
          const parsedClass = cls.match(/-([a-z]+)$/);
          if (parsedClass) {
            const corner = parsedClass[1];
            if (corners.hasOwnProperty(corner)) {
              corners[corner] = borderRadius;
            }

            if (corner === 'radius') {
              corners.tl = borderRadius;
              corners.tr = borderRadius;
              corners.br = borderRadius;
              corners.bl = borderRadius;
            }
          }
        });

        section.style.borderRadius = `${corners.tl} ${corners.tr} ${corners.br} ${corners.bl}`;
      }
    }
  });
}

/**
 * scrolls to the container
 * @param {Element} container to scroll to
 */
function scrollToContainer(container) {
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Transform camelCase to Title Case
 * @param {String} str
 */
function transformType(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (match) => match.toUpperCase());
}

/**
 * /search?query= onclick="alert('XSS')
 * /search?query=click me" onclick=alert('xss') a=
 * /search?query=xx1"><img+src=v+onerror=prompt()>
 *
 * @param input
 * @returns {String}
 */
function sanitizeInput(input) {
  const x = DOMPurify.sanitize(input)
    .replace(/<script.*?>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<\/?[^>]+(>|$)/g, '') // Remove all HTML tags
    .replace(/(on\w+)\s*=\s*(['"]).*?\2/gi, '') // Remove event handlers
    .replace(/(on\w+)\s*=(.*)/gi, '') // Remove event handlers take 2
    .replace(/javascript:/gi, '') // Block `javascript:` URIs
    .replace(/data:/gi, '') // Block `data:` URIs
    .replace(/vbscript:/gi, '') // Block `vbscript:` URIs
    .trim();

  return x;
}

/**
 * Sanitize HTML string to prevent XSS vulnerability
 *
 * @param {String} HTML string
 * @returns {String} sanitized HTML string
 */
function sanitizeHTML(string) {
  return decodeHTMLEntities(string);
}

/**
 * encodeHTMLEntities
 *
 * @param text
 * @returns {string}
 */
function encodeHTMLEntities(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * decodeHTMLEntities
 *
 * @param text
 * @returns {string}
 */
function decodeHTMLEntities(text) {
  var textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

/**
 * determineFilterType
 *
 * @param value string
 * @return { type: string, filter: string }
 */
function determineFilterType(value) {
  if (!value) return null;

  if (value.startsWith('https://')) {
    return { type: 'extUrl', filter: `extUrl:"${value}"` };
  }

  if (value.startsWith('/')) {
    return { type: 'slug', filter: `slug:"${value}"` };
  }
  return { type: 'resourceType', filter: `resourceType:${value}` };
}

/**
 * isValidUrl
 *
 * @param stringContent string
 * @return {boolean}
 */
function isValidUrl(stringContent) {
  try {
    new URL(stringContent);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Return true if newHit found in existingHits
 *
 * @param newHit new hit
 * @param existingHits existing hits
 *
 * @return {boolean}
 */
function isDuplicate(newHit, existingHits) {
  return existingHits.some((hit) => hit.slug === newHit.slug || (hit.extUrl && hit.extUrl === newHit.extUrl));
}

export {
  createCardItem,
  createOrderedCardItem,
  fetchSvg,
  formatDate,
  swipeLeftRight,
  handleSearchSubmit,
  getAlgoliaConfig,
  getSearchTerm,
  buildButtonGroup,
  handleCarouselAction,
  createCarouselNavigation,
  hexToRGB,
  applyBackgroundStylesFromMetadata,
  scrollToContainer,
  transformType,
  sanitizeHTML,
  decodeHTMLEntities,
  encodeHTMLEntities,
  determineFilterType,
  isValidUrl,
  isDuplicate,
};
