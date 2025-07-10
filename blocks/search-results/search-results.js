import { algoliasearch } from 'https://cdn.jsdelivr.net/npm/algoliasearch@5.20.1/+esm';
import {
  handleSearchSubmit,
  getAlgoliaConfig,
  getSearchTerm,
  transformType,
  sanitizeHTML,
} from '../../utils/helper.js';
import { fetchPlaceholders } from '../../scripts/aem.js';

const { baseurl: BASE_URL, primaryindex: PRIMARY_INDEX, resourceindex: RESOURCE_INDEX } = await fetchPlaceholders();

function normalizeHitData(hit, source, indexName) {
  const normalized = {
    ...hit,
    _source: source,
    _indexName: indexName,

    title: hit.title || 'Untitled',
    excerpt: hit.excerpt || '',
    thumb: hit.thumb || hit.image || '',
    slug: hit.slug || null,
    extUrl: hit.extUrl || null,

    contentType: hit.newsResourceType || hit.resourceType || '',
  };

  return normalized;
}

function mergeResults(primaryHits, resourceHits, primaryIndexName, resourceIndexName) {
  const normalizedPrimaryHits = primaryHits.map((hit) => normalizeHitData(hit, 'primary', primaryIndexName));
  const normalizedResourceHits = resourceHits.map((hit) => normalizeHitData(hit, 'resource', resourceIndexName));

  const allHits = [...normalizedPrimaryHits, ...normalizedResourceHits];

  const sortedHits = allHits.sort((a, b) => {
    // primary index results first, then resource
    if (a._source !== b._source) {
      return a._source === 'primary' ? -1 : 1;
    }
    return 0;
  });

  return sortedHits;
}

const createResultCard = (hit) => {
  const hasDescription = hit.excerpt && hit.excerpt.trim() !== '';
  const transformedType = hit.contentType ? transformType(hit.contentType) : '';

  let url;

  if (hit._indexName === RESOURCE_INDEX) {
    // resource  indedx: prioritize extUrl or use slug with BASE_URL
    if (hit.extUrl) {
      url = hit.extUrl;
    } else if (hit.slug) {
      url = `${BASE_URL}${hit.slug}`;
    } else {
      url = `${BASE_URL}/search?query=${encodeURIComponent(hit.title || '')}`;
    }
  } else if (hit._indexName === PRIMARY_INDEX) {
    // primary index: use the slug if available
    if (hit.slug) {
      url = hit.slug;
    } else if (hit.extUrl) {
      url = hit.extUrl;
    } else {
      url = `${BASE_URL}/search?query=${encodeURIComponent(hit.title || '')}`;
    }
  } else {
    if (hit.slug) {
      url = `${BASE_URL}${hit.slug}`;
    } else if (hit.extUrl) {
      url = hit.extUrl;
    } else {
      url = `${BASE_URL}/search?query=${encodeURIComponent(hit.title || '')}`;
    }
  }

  const isExternalUrl = hit.extUrl && url === hit.extUrl;

  const badLogo =
    hit.thumb && hit.thumb.includes('https://cms.recordedfuture.com/uploads/brand_logo_long_black_f2ead5b5c6.svg');

  const imgSrc = badLogo ? '/assets/card-placeholder.png' : hit.thumb;

  return `
    <div class="result-card">
      <div class="card-image"><a href="${url}" ${isExternalUrl ? 'target="_blank" rel="noopener noreferrer"' : ''}>
        <img 
          src="${imgSrc}" 
          alt="${hit.title || ''}" 
          loading="eager"
          onerror="this.onerror=null; 
          this.src='/assets/card-placeholder.png';"
        >
        </a>
        ${transformedType ? `<span class="category">${transformedType}</span>` : ''}
        ${isExternalUrl ? `<span class="external-link-icon"></span>` : ''}
      </div>
      <div class="card-content">
        <h3><a href="${url}" ${isExternalUrl ? 'target="_blank" rel="noopener noreferrer"' : ''}>${hit.title || 'Untitled'}</a></h3>
        ${hasDescription ? `<p class="description">${hit.excerpt}</p>` : ''}
      </div>
    </div>
  `;
};

function createPageButton(pageIndex, container, currentPage, results) {
  const page = document.createElement('span');
  page.textContent = pageIndex + 1;
  page.className = 'page-number' + (pageIndex === currentPage ? ' active' : '');
  page.addEventListener('click', () => {
    results(pageIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  container.append(page);
}

const createPagination = (currentPage, totalPages, results, totalHits, hitsPerPage) => {
  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'pagination-bar';

  const pagination = document.createElement('div');
  pagination.className = 'pagination';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'pagination-button';
  const span = document.createElement('span');
  nextBtn.append(span);
  nextBtn.disabled = currentPage >= totalPages - 1;
  nextBtn.addEventListener('click', () => {
    results(currentPage + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const pageNumber = document.createElement('div');
  pageNumber.className = 'page-numbers';

  // show the first page
  createPageButton(0, pageNumber, currentPage, results);

  // ellipsis if there are more than 5 pages
  if (totalPages > 5) {
    let start, end;
    if (currentPage < 2) {
      start = 1;
      end = 2;
    } else if (currentPage >= totalPages - 2) {
      start = totalPages - 3;
      end = totalPages - 2;
    } else {
      start = currentPage - 1;
      end = currentPage + 1;
    }

    if (start > 1) {
      const ellipsis = document.createElement('span');
      ellipsis.textContent = '...';
      ellipsis.className = 'ellipsis';
      pageNumber.append(ellipsis);
    }

    for (let i = start; i <= end; i++) {
      createPageButton(i, pageNumber, currentPage, results);
    }

    // between middle group and last page if needed
    if (end < totalPages - 2) {
      const ellipsis = document.createElement('span');
      ellipsis.textContent = '...';
      ellipsis.className = 'ellipsis';
      pageNumber.append(ellipsis);
    }
  } else {
    for (let i = 1; i < totalPages - 1; i++) {
      createPageButton(i, pageNumber, currentPage, results);
    }
  }

  // show the last page
  if (totalPages > 1) {
    createPageButton(totalPages - 1, pageNumber, currentPage, results);
  }

  const startHit = currentPage * hitsPerPage + 1;
  const endHit = Math.min((currentPage + 1) * hitsPerPage, totalHits);

  const pageCounter = document.createElement('span');
  pageCounter.className = 'page-counter';
  pageCounter.textContent = `${startHit}-${endHit} of ${totalPages} pages`;

  pagination.append(pageNumber, nextBtn);
  paginationContainer.append(pageCounter, pagination);
  return paginationContainer;
};

export default async function decorate(block) {
  const wrapper = document.querySelector('.search-results');
  const params = new URLSearchParams(window.location.search);
  const query = getSearchTerm();
  const initialPage = parseInt(params.get('page')) - 1 || 0;

  wrapper.innerHTML = `
  <div class="results-container">
    <div class="results-header">
    <p class="results-count">Showing results for...</p>
      <input type="text" class="search-input" value="${sanitizeHTML(query)}" aria-label="Search" />
           <button class="nav-search-button" aria-label="Submit search">
            <span></span>
          </button>
    </div>
    <div class="results-grid"></div>
  </div>
`;

  const grid = block.querySelector('.results-grid');
  const container = wrapper.querySelector('.results-container');
  const searchButton = wrapper.querySelector('.nav-search-button');
  const searchInput = wrapper.querySelector('.search-input');
  const { appid, apikey } = await getAlgoliaConfig();
  const client = algoliasearch(appid, apikey);
  handleSearchSubmit(searchButton, searchInput);

  let currentPage = 0;
  let totalPages = 0;
  const hitsPerPage = 12;

  const loadResults = async (page) => {
    try {
      grid.innerHTML = '<div class="loading">Loading results...</div>';

      const primaryIndexName = PRIMARY_INDEX;
      const secondaryIndexName = RESOURCE_INDEX;

      const { results: searchResponse } = await client.search([
        {
          indexName: primaryIndexName,
          query: searchInput.value,
          hitsPerPage: 12,
          page: page,
        },
        {
          indexName: secondaryIndexName,
          query: searchInput.value,
          hitsPerPage: 12,
          page: page,
        },
      ]);

      const primaryResults = searchResponse[0];
      const secondaryResults = searchResponse[1];

      const mergedHits = mergeResults(primaryResults.hits, secondaryResults.hits, primaryIndexName, secondaryIndexName);

      // pagination
      const totalHits = primaryResults.nbHits + secondaryResults.nbHits;
      totalPages = Math.max(primaryResults.nbPages, secondaryResults.nbPages);
      currentPage = page;

      const url = new URL(window.location);
      if (currentPage > 0) {
        url.searchParams.set('page', currentPage + 1);
      } else {
        url.searchParams.delete('page');
      }
      url.searchParams.set('query', searchInput.value);
      window.history.replaceState({ path: url.href }, '', url.href);

      const existingPagination = container.querySelector('.pagination-bar');
      if (existingPagination) existingPagination.remove();

      if (mergedHits.length > 0) {
        grid.innerHTML = mergedHits.map(createResultCard).join('');
        const countElement = wrapper.querySelector('.results-count');
        countElement.textContent = `Showing ${totalHits} results for...`;

        if (totalPages > 1) {
          container.append(createPagination(currentPage, totalPages, loadResults, totalHits, hitsPerPage));
        }
      } else {
        grid.innerHTML = `
        <div class="no-results">
          <h3>No results found for "${sanitizeHTML(searchInput.value)}"</h3>
        </div>
      `;
      }
    } catch (error) {
      console.error('Search error:', error);
      grid.innerHTML = `
        <div class="error-message">
          <h3>Sorry, we encountered an error with your search</h3>
          <p>Please try again later.</p>
        </div>
      `;
    }
  };

  loadResults(initialPage);
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      loadResults(0);
    }
  });
}
