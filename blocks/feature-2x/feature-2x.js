import { getAlgoliaConfig, formatDate, determineFilterType, isDuplicate } from '../../utils/helper.js';
import { algoliasearch } from 'https://cdn.jsdelivr.net/npm/algoliasearch@5.20.1/+esm';
import { fetchPlaceholders } from '../../scripts/aem.js';

const { testurl: BASE_URL } = await fetchPlaceholders();

const notFound = (resourceType) => {
  return {
    thumb: '/assets/card-placeholder.png',
    title: '',
    excerpt: 'No articles found',
    date: '',
    resourceType: resourceType,
  };
};

const getResourceTypes = (block) => {
  const resourceTypeElements = block.querySelectorAll(':scope > div');
  const extractedResourceTypes = [];

  for (let i = 0; i < resourceTypeElements.length; i++) {
    const typeElement = resourceTypeElements[i].querySelector('p');
    if (typeElement && typeElement.textContent.trim()) {
      extractedResourceTypes.push(typeElement.textContent.trim());
    }
  }

  return extractedResourceTypes;
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

  let dateAndAuthor = formatDate(card.date);
  if (card.author && card.date) {
    dateAndAuthor += ' • ';
  }
  if (card.author) {
    dateAndAuthor += card.author;
  }

  const containerWrapper = document.createElement('div');
  containerWrapper.innerHTML = `<div class='thumbnail'>
                            <img 
                              src="${card.thumbnail}" 
                              alt="${card.title || ''}" 
                              loading="eager"
                              onerror="this.onerror=null; this.src='/assets/card-placeholder.png';"
                             >
                            </div>
                            <div class='cards-data'>
                              <p class='author-date'>${dateAndAuthor}</p>
                              <h3 class='title'>${card.title || 'Untitled'}</h3>
                              <p class='description'>${card.description}</p>
                            </div>`;

  anchorWrapper.append(containerWrapper);
  return anchorWrapper;
};

/**
 * loads and decorates the feature-2x block
 * @param {Element} block The feature-2x block element
 */
export default async function decorate(block) {
  const extractedResourceTypes = getResourceTypes(block);

  const featureHits = [];
  try {
    const { appid, apikey, testedsindex } = await getAlgoliaConfig();
    const algoliaClient = algoliasearch(appid, apikey);

    // search resources
    for (const identifier of extractedResourceTypes) {
      const filterInfo = determineFilterType(identifier);
      const hitsToFetch = filterInfo.type === 'resourceType' ? 2 : 1;

      const request = {
        indexName: testedsindex,
        hitsPerPage: hitsToFetch,
        filters: filterInfo.filter,
      };

      const { results } = await algoliaClient.search([request]);

      if (results[0].hits.length > 0) {
        if (filterInfo.type === 'slug') {
          const hit = results[0].hits[0];
          if (!isDuplicate(hit, featureHits)) {
            featureHits.push(hit);
          }
        } else {
          for (const hit of results[0].hits) {
            if (!isDuplicate(hit, featureHits)) {
              featureHits.push(hit);
              break;
            }
          }
        }
      }
    }

    // create cards with featureHits
    const cardsBlock = document.createElement('div');
    cardsBlock.classList.add('cards-block');
    if (featureHits.length > 0) {
      featureHits.forEach((hit) => {
        const cardWrapper = createCard(hit);
        cardsBlock.append(cardWrapper);
      });
    } else {
      cardsBlock.append(createCard(notFound(resourceType)));
    }

    block.innerHTML = '';
    block.append(cardsBlock);
  } catch (error) {
    console.error('Error loading feature-2x data:', error);
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message');
    errorMessage.innerHTML = `
      <h3>Sorry, we encountered an error loading the feature-2x data</h3>
      <p>Please try again later.</p>
    `;
    block.innerHTML = '';
    block.append(errorMessage);
  }
}
