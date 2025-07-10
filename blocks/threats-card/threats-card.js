import { fetchSvg, getAlgoliaConfig, transformType, formatDate } from '../../utils/helper.js';
import { algoliasearch } from 'https://cdn.jsdelivr.net/npm/algoliasearch@5.20.1/+esm';
import { fetchPlaceholders } from '../../scripts/aem.js';

const { baseurl: BASE_URL } = await fetchPlaceholders();

const notFound = (resourceType) => {
  return {
    thumb: '/assets/card-placeholder.png',
    title: '',
    excerpt: 'No articles found',
    date: '',
    resourceType: resourceType,
  };
};

function createThreatCardItem(hit) {
  const card = {
    thumbnail: hit.thumb || hit.image || '/assets/card-placeholder.png',
    title: hit.title || 'Untitled',
    description: hit.excerpt || '',
    date: hit.date || '',
    tag: hit.newsResourceType || hit.resourceType || '',
  };

  let cardLink = null;
  if (hit.slug) {
    cardLink = `${BASE_URL}${hit.slug}`;
  } else if (hit.extUrl) {
    cardLink = hit.extUrl;
  }

  const isExternalUrl = hit.extUrl && cardLink === hit.extUrl;
  const transformedType = card.tag ? transformType(card.tag) : '';
  const cardFormattedDate = card.date ? formatDate(card.date) : '';

  const threatItem = document.createElement('div');
  threatItem.className = 'threat-card-item';
  threatItem.innerHTML = `<div class='threat-card-item-image'>
                            <img 
                              src="${card.thumbnail}" 
                              alt="${card.title || ''}" 
                              loading="lazy"
                              onerror="this.onerror=null; 
                              this.src='/assets/card-placeholder.png';"
                             >
                            </div>
                              <p class='threat-card-item-date'>${cardFormattedDate}</p>
                              <a href="${cardLink}" ${isExternalUrl ? 'target="_blank" rel="noopener noreferrer"' : ''}>${card.title || 'Untitled'}</a>
                              <p class='threat-card-item-description'>${card.description}</p>
                            <div class='threat-card-item-content-tag'><p>${transformedType}</p></div>`;
  return threatItem;
}

function createThreatsCard(row, hit, linkIcon) {
  const [title, button] = row.children;
  title.className = 'threats-card-title';

  const threatCardItemsWrapper = document.createElement('div');
  threatCardItemsWrapper.className = 'threats-card-items-wrapper';

  const cardItem = createThreatCardItem(hit);
  threatCardItemsWrapper.append(cardItem);

  const buttonLink = button.querySelector('a');
  buttonLink.className = 'threat-card-view-all-button';
  buttonLink.innerHTML = `${buttonLink.textContent}${linkIcon}`;

  return [title, threatCardItemsWrapper, buttonLink];
}

function getAllResourceType(block) {
  const resourceTypeRow = block.children[1];
  const pElements = resourceTypeRow.getElementsByTagName('p');
  const resourceTypes = [...pElements].map((item) => {
    return item.textContent;
  });
  // console.log('Resource Types:', resourceTypes);
  return resourceTypes;
}

export default async function decorate(block) {
  const [blogRow, reportsRow] = [...block.firstElementChild.children];
  const linkIcon = await fetchSvg('east');
  const resourceTypes = getAllResourceType(block);

  try {
    const { appid, apikey, resourceindexdate, primaryindex } = await getAlgoliaConfig();
    const algoliaClient = algoliasearch(appid, apikey);

    const promises = resourceTypes.map((resourceType) => {
      let filter;
      let indexToUse;

      if (resourceType === 'blog') {
        filter = `resourceType:${resourceType}`;
        indexToUse = primaryindex;
      } else if (resourceType === 'research') {
        filter = `newsResourceType:${resourceType}`;
        indexToUse = resourceindexdate;
      } else {
        filter = `newsResourceType:${resourceType}`;
        indexToUse = resourceindexdate;
      }

      const request = {
        indexName: indexToUse,
        hitsPerPage: 1,
        filters: filter,
      };

      return algoliaClient.search([request]).then((response) => {
        return { resourceType, response };
      });
    });

    const resourceTypeWithResults = await Promise.all(promises);

    const cards = resourceTypeWithResults.map((item, index) => {
      let hit;
      if (item.response?.results.length === 0 || item.response.results[0]?.hits.length === 0) {
        hit = notFound(item.resourceType);
      } else {
        hit = item.response.results[0].hits[0];
      }
      const row = index === 0 ? blogRow : reportsRow;
      return createThreatsCard(row, hit, linkIcon);
    });

    const [blogCardTitle, blogCard, blogCardButton] = cards[0];
    const [reportsCardTitle, reportsCard, reportsCardButton] = cards[1];

    block.textContent = '';
    block.append(blogCardTitle, reportsCardTitle, blogCard, reportsCard, blogCardButton, reportsCardButton);
  } catch (error) {
    console.error('Error loading threat-card data:', error);
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message');
    errorMessage.innerHTML = `
      <h3>Sorry, we encountered an error loading the threat-card</h3>
      <p>Please try again later.</p>
    `;
    block.innerHTML = '';
    block.append(errorMessage);
  }
}
