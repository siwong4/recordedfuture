/**
 * loads and decorates the related-resources block
 * @param {Element} block The related-resources block element
 */
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

const ConvertHitToCard = (hit) => {
  const card = {
    link: hit.extUrl ? hit.extUrl : hit.slug ? `${BASE_URL}${hit.slug}` : '#',
    thumbnail: hit.thumb || hit.image || '/assets/card-placeholder.png',
    title: hit.title || 'Untitled',
    description: hit.excerpt || '',
    date: hit.publishedDate || '',
    tags: hit.newsResourceType || hit.resourceType || '',
  };
  return card;
};

const createCard = (card, showDate = false) => {
  const cardWrapper = document.createElement('div');
  cardWrapper.classList.add('card-wrapper');
  let containerWrapper = cardWrapper;

  if (card.link) {
    const anchorWrapper = document.createElement('a');
    anchorWrapper.href = card.link;
    anchorWrapper.classList.add('card-wrapper');
    anchorWrapper.setAttribute('aria-label', `Go to ${card.title}`);
    anchorWrapper.setAttribute('role', 'link');
    // anchorWrapper.setAttribute('target', '_blank');
    anchorWrapper.setAttribute('rel', 'noopener noreferrer');
    cardWrapper.append(anchorWrapper);
    containerWrapper = anchorWrapper;
  }

  if (card.thumbnail) {
    const thumbnailWrapper = document.createElement('div');
    thumbnailWrapper.classList.add('thumbnail');
    const thumbnail = document.createElement('img');
    thumbnail.src = card.thumbnail;
    thumbnail.alt = '';
    thumbnailWrapper.append(thumbnail);
    containerWrapper.append(thumbnailWrapper);
  }

  if (card.date && showDate) {
    const date = document.createElement('p');
    date.classList.add('date');
    date.innerText = formatDate(card.date);
    containerWrapper.append(date);
  }

  if (card.title) {
    const title = document.createElement('h3');
    title.classList.add('title');
    title.innerText = card.title;

    containerWrapper.append(title);
  }

  if (card.description) {
    const description = document.createElement('p');
    description.classList.add('description');
    description.innerText = card.description;
    containerWrapper.append(description);
  }

  if (card.tags) {
    const tagsWrapper = document.createElement('div');
    tagsWrapper.classList.add('tags');

    card.tags.split(',').forEach((tagLabel) => {
      const tag = document.createElement('p');
      tag.classList.add('tag');
      tag.innerText = tagLabel;
      tagsWrapper.append(tag);
    });

    containerWrapper.append(tagsWrapper);
  }

  return containerWrapper;
};

const decorateFromJson = async (block) => {
  // info block
  const infoBlock = block.querySelector(':scope > div:nth-child(2) > div');
  infoBlock.classList.add('info-block');

  // cards block
  const { href } = block.querySelector(':scope > div:nth-child(1) a');
  const resp = await fetch(href);
  const { data } = await resp.json();

  const cardsBlock = document.createElement('div');
  cardsBlock.classList.add('cards-block');

  data.slice(0, 3).forEach((card) => {
    cardsBlock.append(createCard(card));
  });

  // view more block
  const viewMoreBlock = block.querySelector(':scope > div:nth-child(3) > div');
  const viewMoreLink = viewMoreBlock.querySelector('a');
  viewMoreLink.classList.add('primary');

  block.innerHTML = '';
  block.append(infoBlock, cardsBlock, viewMoreBlock);
};

const getResourceTypes = (block) => {
  const resourceTypeElements = block.querySelectorAll(':scope > div');
  const extractedResourceTypes = [];

  for (let i = 0; i < resourceTypeElements.length; i++) {
    const button = resourceTypeElements[i].querySelector('.button-container');
    if (button) continue;
    const typeElement = resourceTypeElements[i].querySelector('p');
    if (typeElement && typeElement.textContent.trim()) {
      extractedResourceTypes.push(typeElement.textContent.trim());
    }
  }

  return extractedResourceTypes;
};

export default async function decorate(block) {
  const showDate = block.classList.contains('show-date');

  if (block.classList.contains('v2')) {
    const extractedResourceTypes = getResourceTypes(block);

    const featureHits = [];
    try {
      const { appid, apikey, testedsindex } = await getAlgoliaConfig();
      const algoliaClient = algoliasearch(appid, apikey);

      // search resources
      for (const identifier of extractedResourceTypes) {
        const filterInfo = determineFilterType(identifier);
        const hitsToFetch = filterInfo.type === 'resourceType' ? 5 : 1;

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
          const cardWrapper = createCard(ConvertHitToCard(hit), showDate);
          cardsBlock.append(cardWrapper);
        });
      } else {
        cardsBlock.append(createCard(notFound(resourceType), showDate));
      }
      block.innerHTML = '';
      block.append(cardsBlock);

      // view more block
      const viewMoreBlock = block.querySelector(':scope > div > .button-container');
      if (viewMoreBlock) {
        const viewMoreLink = viewMoreBlock.querySelector('a');
        viewMoreLink.classList.add('primary');
        block.append(viewMoreBlock);
      }
    } catch (error) {
      console.error('Error loading related resources data:', error);
      const errorMessage = document.createElement('div');
      errorMessage.classList.add('error-message');
      errorMessage.innerHTML = `
      <h3>Sorry, we encountered an error loading the related resources data</h3>
      <p>Please try again later.</p>
    `;
      block.innerHTML = '';
      block.append(errorMessage);
    }
  } else {
    await decorateFromJson(block);
  }
}
