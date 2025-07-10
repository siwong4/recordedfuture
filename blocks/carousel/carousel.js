import { algoliasearch } from 'https://cdn.jsdelivr.net/npm/algoliasearch@5.20.1/+esm';
import {
  formatDate,
  getAlgoliaConfig,
  createCarouselNavigation,
  swipeLeftRight,
  SWIPE_DIRECTION,
  transformType,
} from '../../utils/helper.js';

import { fetchPlaceholders, createOptimizedPicture, optimizeAlgoliaImg } from '../../scripts/aem.js';

const { baseurl: BASE_URL } = await fetchPlaceholders();
let algoliaClient = null;

function handleCarouselAction(slides, carouselContainer, direction, targetIndex = null, options = {}) {
  const itemCount = slides.length;
  const indicators = [...carouselContainer.querySelectorAll('.indicators li')];

  const mod = (n, m) => {
    return ((n % m) + m) % m;
  };

  let currentActiveIndex = 0;
  for (let i = 0; i < itemCount; i += 1) {
    if (slides[i].classList.contains('active')) {
      currentActiveIndex = i;
      break;
    }
  }

  slides[currentActiveIndex].classList.remove('active');
  indicators[currentActiveIndex].classList.remove('active');

  let nextActive = targetIndex !== null ? targetIndex : mod(currentActiveIndex + direction, itemCount);

  if (!slides[nextActive] || !indicators[nextActive]) {
    nextActive = 0;
  }

  slides[nextActive].classList.add('active');
  indicators[nextActive].classList.add('active');

  const scrollY = window.scrollY;

  const slider = slides[0].parentElement;

  // handle scrolling within container if specified
  if (options.container) {
    const slideWidth = slides[0].offsetWidth + parseInt(window.getComputedStyle(slides[0]).marginRight, 10);
    const translateX = -1 * nextActive * slideWidth;

    // transform to create slide animation
    slider.style.transition = 'transform 0.3s ease-in-out';
    slider.style.transform = `translateX(${translateX}px)`;
  } else if (!options.preventScroll) {
    slides[nextActive].scrollTo({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }

  if (!options.preventScroll) {
    window.scrollTo({
      top: scrollY,
      behavior: 'smooth',
    });
  }

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

function setupSwipeNavigation(carouselElement, slides, navigationContainer) {
  const interactiveElements = carouselElement.querySelectorAll('a, img');
  interactiveElements.forEach((element) => {
    element.addEventListener(
      'touchstart',
      (e) => {
        e.target.dataset.touchStarted = 'true';
      },
      { passive: true }
    );

    element.addEventListener(
      'touchend',
      (e) => {
        if (e.target.dataset.wasSwiping !== 'true') {
        } else {
          e.preventDefault();
        }
        delete e.target.dataset.touchStarted;
        delete e.target.dataset.wasSwiping;
      },
      { passive: false }
    );
  });

  carouselElement.addEventListener(
    'touchstart',
    function (e) {
      const touchStartX = e.touches[0].clientX;
      const touchStartY = e.touches[0].clientY;
      let isVerticalScroll = false;
      let hasMovedEnough = false;

      const touchMoveHandler = function (e) {
        if (!e.touches[0]) return;

        const touchCurrentX = e.touches[0].clientX;
        const touchCurrentY = e.touches[0].clientY;
        const diffX = touchStartX - touchCurrentX;
        const diffY = touchStartY - touchCurrentY;

        if (e.target.dataset.touchStarted === 'true' && Math.abs(diffX) > 10) {
          e.target.dataset.wasSwiping = 'true';
        }
        if (!isVerticalScroll) {
          isVerticalScroll = Math.abs(diffY) > Math.abs(diffX);
        }
        if (!isVerticalScroll && Math.abs(diffX) > 10) {
          hasMovedEnough = true;
        }
        if (!isVerticalScroll) {
          e.preventDefault();
        }
      };

      const touchEndHandler = function (e) {
        carouselElement.removeEventListener('touchmove', touchMoveHandler);
        carouselElement.removeEventListener('touchend', touchEndHandler);
        if (hasMovedEnough) {
          e.preventDefault();
        }
      };

      carouselElement.addEventListener('touchmove', touchMoveHandler, { passive: false });
      carouselElement.addEventListener('touchend', touchEndHandler, { passive: false });
    },
    { passive: false }
  );

  swipeLeftRight(carouselElement, (direction) => {
    if (direction === SWIPE_DIRECTION.LEFT) {
      handleCarouselAction(slides, navigationContainer, -1, null, {
        container: carouselElement.closest('.slider-container'),
        preventScroll: true,
      });
    } else if (direction === SWIPE_DIRECTION.RIGHT) {
      handleCarouselAction(slides, navigationContainer, 1, null, {
        container: carouselElement.closest('.slider-container'),
        preventScroll: true,
      });
    }
  });
  slides.forEach((slide) => {
    const children = slide.querySelectorAll('*');
    children.forEach((child) => {
      child.addEventListener(
        'touchstart',
        (e) => {
          e.stopPropagation();
          const newEvent = new TouchEvent('touchstart', {
            bubbles: true,
            cancelable: true,
            touches: e.touches,
            targetTouches: e.targetTouches,
            changedTouches: e.changedTouches,
          });
          carouselElement.dispatchEvent(newEvent);
        },
        { passive: true }
      );
    });
  });
}

function isDuplicate(newHit, existingHits, baseCardHit = null, currentType = null) {
  if (baseCardHit) {
    if (baseCardHit.slug && newHit.slug && baseCardHit.slug === newHit.slug) {
      return true;
    }
    if (baseCardHit.extUrl && newHit.extUrl && baseCardHit.extUrl === newHit.extUrl) {
      return true;
    }
  }

  if (currentType === 'extUrl' || currentType === 'slug') {
    return false;
  }
  return existingHits.some((hit) => hit.slug === newHit.slug || (hit.extUrl && hit.extUrl === newHit.extUrl));
}

const decorateCard = (hit, wrapper) => {
  const card = {
    thumbnail: hit.thumb || hit.image || '/assets/card-placeholder.png',
    title: hit.title || 'Untitled',
    description: hit.excerpt || '',
    date: hit.date || '',
    tag: hit.newsResourceType || hit.resourceType || '',
  };

  let tag = null;
  let cardLink = null;

  if (hit.slug) {
    cardLink = `${BASE_URL}${hit.slug}`;
  } else if (hit.extUrl) {
    cardLink = hit.extUrl;
  }

  if (card.tag) {
    const transformedTag = transformType(card.tag);
    tag = document.createElement('span');
    tag.classList.add('content-tag');
    tag.innerText = transformedTag;
  }

  if (card.thumbnail) {
    const thumbnailWrapper = document.createElement('div');
    thumbnailWrapper.classList.add('thumbnail-wrapper');

    const isExtUrl = card.thumbnail.match(/^(https?:)?\/\//i);
    if (cardLink) {
      const thumbnailLink = document.createElement('a');
      thumbnailLink.href = cardLink;

      const thumbnailImage = isExtUrl
        ? optimizeAlgoliaImg(card.thumbnail, card.title || '', false)
        : createOptimizedPicture(card.thumbnail, card.title || '', false);

      thumbnailLink.append(thumbnailImage);
      thumbnailWrapper.append(thumbnailLink);
    }

    if (tag) {
      thumbnailWrapper.append(tag);
    }
    wrapper.append(thumbnailWrapper);
  } else if (tag) {
    wrapper.append(tag);
  }

  if (card.date) {
    const date = document.createElement('p');
    date.classList.add('date');
    date.innerText = formatDate(card.date);
    wrapper.append(date);
  }

  if (card.title) {
    const titleContainer = document.createElement('h6');
    titleContainer.classList.add('title');

    if (cardLink) {
      const link = document.createElement('a');
      link.href = cardLink;
      link.innerText = card.title;
      titleContainer.append(link);
    } else {
      titleContainer.innerText = card.title;
    }

    wrapper.append(titleContainer);
  }

  if (card.description) {
    const description = document.createElement('p');
    description.classList.add('description');
    description.innerText = card.description;
    wrapper.append(description);
  }

  if (card.type) {
    const type = document.createElement('p');
    type.classList.add('content-type');
    type.innerText = card.type;
    wrapper.append(type);
  }
};

function applyGrayscale(container) {
  const isGrayscaleLead = container.dataset.grayscaleLead === 'true';
  const isGrayscaleSlider = container.dataset.grayscaleSlider === 'true';

  const baseCardImage = container.querySelector('.base-card img');
  const slideImages = container.querySelectorAll('.slide img');

  if (baseCardImage) {
    if (isGrayscaleLead) {
      baseCardImage.classList.add('grayscale');
    } else {
      baseCardImage.classList.remove('grayscale');
    }
  }

  slideImages.forEach((slideImage) => {
    if (isGrayscaleSlider) {
      slideImage.classList.add('grayscale');
    } else {
      slideImage.classList.remove('grayscale');
    }
  });
}

function determineFilterType(value) {
  if (!value) return null;

  if (value.startsWith('blog')) {
    return { type: 'resourceType', filter: `resourceType:${value}` };
  }
  if (value.startsWith('research')) {
    return { type: 'resourceType', filter: `newsResourceType:${value}` };
  }

  if (value.startsWith('https://')) {
    return { type: 'extUrl', filter: `extUrl:"${value}"` };
  }

  if (value.startsWith('/')) {
    return { type: 'slug', filter: `slug:"${value}"` };
  }
  return { type: 'resourceType', filter: `resourceType:${value}` };
}

export default async function decorate(block) {
  if (!block) return;

  const container = block.closest('.carousel-container');
  if (container) {
    applyGrayscale(container);
  }

  // heading
  const title = block.querySelector(':scope > div h1');
  const heading = document.createElement('h2');
  heading.classList.add('heading');
  heading.innerText = title ? title.innerText : '';

  // extract resource type values from HTML for slides
  const resourceTypeElements = block.querySelectorAll(':scope > div');
  const extractedResourceTypes = [];

  for (let i = 2; i < resourceTypeElements.length - 1; i++) {
    const typeElement = resourceTypeElements[i].querySelector('div:nth-child(2) > p');
    if (typeElement && typeElement.textContent.trim()) {
      extractedResourceTypes.push(typeElement.textContent.trim());
    }
  }

  // use default types as fallback
  if (extractedResourceTypes.length === 0) {
    extractedResourceTypes.push('blog', 'research', 'pressRelease', 'caseStudy');
  }

  // carousel cards block
  const cardsBlock = block.querySelector(':scope > div:nth-child(2)');
  cardsBlock.classList.add('cards-block');

  // extract base card path
  const baseCardPathElement = cardsBlock.querySelector(':scope > div:nth-child(2) > p');
  const baseCardPath = baseCardPathElement ? baseCardPathElement.textContent.trim() : null;

  const baseCard = document.createElement('div');
  baseCard.classList.add('base-card');

  const baseCardLoading = document.createElement('div');
  baseCardLoading.classList.add('loading');
  baseCardLoading.innerText = 'Loading content...';
  baseCard.append(baseCardLoading);

  // carousel
  const sliderBlock = document.createElement('div');
  sliderBlock.classList.add('slider-block');
  const carouselWrapper = document.createElement('div');
  carouselWrapper.classList.add('slider-container');
  const carouselCards = document.createElement('div');
  carouselCards.classList.add('slider');
  carouselCards.setAttribute('id', 'slider');

  const loadingIndicator = document.createElement('div');
  loadingIndicator.classList.add('loading');
  loadingIndicator.innerText = 'Loading carousel...';
  carouselCards.append(loadingIndicator);

  carouselWrapper.append(carouselCards);
  sliderBlock.append(carouselWrapper);

  cardsBlock.innerHTML = '';
  cardsBlock.append(baseCard, sliderBlock);

  // info block
  const infoBlock = block.querySelector(':scope > div:last-child > div');
  if (infoBlock) {
    infoBlock.classList.add('info-block');
    const buttonsParagraph = infoBlock.querySelector('p:has(a)');
    const buttons = buttonsParagraph?.querySelectorAll('a');
    const buttonsWrapper = document.createElement('div');
    buttons?.forEach((button, i) => {
      if (button) {
        button.classList.add('button', i === 0 ? 'secondary' : 'primary');
        buttonsWrapper.append(button);
      }
    });
    if (buttonsParagraph) infoBlock.removeChild(buttonsParagraph);
    infoBlock.append(buttonsWrapper);
  }

  block.innerHTML = '';
  const blockElements = [heading, cardsBlock, infoBlock].filter((block) => block);
  block.append(...blockElements);

  setTimeout(async () => {
    try {
      const { appid, apikey, resourceindexdate, primaryindex } = await getAlgoliaConfig();
      algoliaClient = algoliasearch(appid, apikey);
      let baseCardHit = null;

      if (baseCardPath) {
        const filterInfo = determineFilterType(baseCardPath);

        const indexToUse = filterInfo.filter === 'resourceType:blog' ? primaryindex : resourceindexdate;

        if (filterInfo) {
          const baseCardRequest = {
            indexName: indexToUse,
            hitsPerPage: 1,
            filters: filterInfo.filter,
          };

          const baseCardResult = await algoliaClient.search([baseCardRequest]);
          if (baseCardResult.results[0].hits.length > 0) {
            baseCardHit = baseCardResult.results[0].hits[0];
            baseCard.innerHTML = '';
            decorateCard(baseCardHit, baseCard);
            if (container) {
              applyGrayscale(container);
            }
          } else {
            baseCard.innerHTML = '<div class="no-results"><p>Article not found</p></div>';
          }
        }
      }

      const carouselHits = [];

      const processIdentifiers = async () => {
        for (const identifier of extractedResourceTypes) {
          if (carouselHits.length >= 4) break;

          const filterInfo = determineFilterType(identifier);
          if (!filterInfo) continue;

          const indexToUse = filterInfo.filter === 'resourceType:blog' ? primaryindex : resourceindexdate;
          // console.log(`Using index: ${indexToUse} for filter: ${filterInfo.filter}`);

          // get multiple results to find unique items
          const hitsToFetch = filterInfo.type === 'resourceType' ? 10 : 1;

          const request = {
            indexName: indexToUse,
            hitsPerPage: hitsToFetch,
            filters: filterInfo.filter,
          };

          try {
            const { results } = await algoliaClient.search([request]);
            // console.log(`Results for ${identifier}:`, results);

            if (results[0].hits.length > 0) {
              if (filterInfo.type === 'extUrl' || filterInfo.type === 'slug') {
                const hit = results[0].hits[0];
                if (!isDuplicate(hit, [], baseCardHit, filterInfo.type)) {
                  carouselHits.push(hit);
                }
              } else {
                for (const hit of results[0].hits) {
                  if (!isDuplicate(hit, carouselHits, baseCardHit, filterInfo.type)) {
                    carouselHits.push(hit);
                    break;
                  }
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching results for ${identifier}:`, error);
          }
        }

        if (carouselHits.length < 4) {
          const additionalRequest = {
            indexName: primaryindex,
            hitsPerPage: 10,
          };

          try {
            const { results } = await algoliaClient.search([additionalRequest]);

            for (const hit of results[0].hits) {
              if (carouselHits.length >= 4) break;

              if (!isDuplicate(hit, carouselHits, baseCardHit, 'resourceType')) {
                carouselHits.push(hit);
              }
            }
          } catch (error) {
            console.error('Error loading carousel data:', error);
          }
        }

        return carouselHits;
      };

      await processIdentifiers();

      carouselCards.innerHTML = '';

      if (carouselHits.length === 0) {
        const noResults = document.createElement('div');
        noResults.classList.add('no-results');
        noResults.innerHTML = '<h3>No articles found</h3>';
        carouselCards.append(noResults);
      } else {
        carouselHits.forEach((hit, index) => {
          const carouselCardWrapper = document.createElement('div');
          carouselCardWrapper.classList.add('slide');
          if (index === 0) {
            carouselCardWrapper.classList.add('active');
          }
          decorateCard(hit, carouselCardWrapper);
          carouselCards.append(carouselCardWrapper);
        });
        if (container) {
          applyGrayscale(container);
        }

        const slides = carouselCards.querySelectorAll('.slide');
        const carouselNavigation = createCarouselNavigation(slides, (slides, container, direction, targetIndex) => {
          handleCarouselAction(slides, container, direction, targetIndex, {
            container: carouselCards.closest('.slider-container'),
            preventScroll: true,
          });
        });

        sliderBlock.append(carouselNavigation);

        setupSwipeNavigation(carouselCards, slides, carouselNavigation);
      }
    } catch (error) {
      console.error('Error loading carousel data:', error);

      carouselCards.innerHTML = '';
      const errorMessage = document.createElement('div');
      errorMessage.classList.add('error-message');
      errorMessage.innerHTML = `
        <h3>Sorry, we encountered an error loading the carousel</h3>
        <p>Please try again later.</p>
      `;
      carouselCards.append(errorMessage);

      baseCard.innerHTML = '';
      const baseCardError = document.createElement('div');
      baseCardError.classList.add('error-message');
      baseCardError.innerHTML = `
        <h3>Sorry, we encountered an error loading the content</h3>
        <p>Please try again later.</p>
      `;
      baseCard.append(baseCardError);
    }
  }, 0);
}
