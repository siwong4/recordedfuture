import { algoliasearch } from 'https://cdn.jsdelivr.net/npm/algoliasearch@5.20.1/+esm';
import { getAlgoliaConfig, transformType } from '../../utils/helper.js';

const cardsPerPage = 9;

const scrollIntoViewWithOffset = (element, offset) => {
  window.scrollTo({
    behavior: 'smooth',
    top: element.getBoundingClientRect().top - document.body.getBoundingClientRect().top - offset,
  });
};

const createBlogCard = (hit) => {
  const card = {
    thumbnail: hit.thumb || hit.image || '/assets/card-placeholder.png',
    title: hit.title || 'Untitled',
    name: hit.name || '',
    tags: hit.newsResourceType || hit.resourceType || '',
    link: hit.extUrl || hit.slug || '#',
  };

  const transformedType = card.tags ? transformType(card.tags) : '';

  const cardWrapper = `
      <div class="blog-card-wrapper">
        <div class="card-image">
          <img src="${card.thumbnail}" alt="${card.title}" loading="eager" onerror="this.onerror=null; this.src='/assets/card-placeholder.png';">
        </div>
        <div class="card-content">
           <h4 class="title"><a href="${card.link}">${card.title}</a></h4>
           <p class="company-name">${card.name}</p>
           <div class="tags">${transformedType}</div>
           </div>
      </div>
    `;

  return cardWrapper;
};

let algoliaClient = null;
let resourceIndexName = null;
let categoryFilter = null;

const createPageButton = (pageIndex, pageNumDiv, currentPage, loadPageData, container) => {
  const page = document.createElement('span');
  page.textContent = pageIndex + 1;
  page.className = 'page-number' + (pageIndex === currentPage ? ' active' : '');
  page.addEventListener('click', () => {
    loadPageData(pageIndex, container);
    const sectionDiv = container.parentElement.parentElement.parentElement;
    scrollIntoViewWithOffset(sectionDiv, 50);
  });
  pageNumDiv.append(page);
};

const createPagination = (currentPage, totalHits, totalPages, loadPageData, container) => {
  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'pagination-bar';

  const pagination = document.createElement('div');
  pagination.className = 'pagination';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'pagination-button';
  nextBtn.setAttribute('aria-label', 'Next page');
  const span = document.createElement('span');

  nextBtn.append(span);
  nextBtn.disabled = currentPage >= totalPages - 1;

  nextBtn.addEventListener('click', () => {
    loadPageData(currentPage + 1, container);
    const sectionDiv = container.parentElement.parentElement.parentElement;
    scrollIntoViewWithOffset(sectionDiv, 50);
  });

  const pageNumberDiv = document.createElement('div');
  pageNumberDiv.className = 'page-numbers';

  // show the first page
  createPageButton(0, pageNumberDiv, currentPage, loadPageData, container);

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
      pageNumberDiv.append(ellipsis);
    }

    for (let i = start; i <= end; i++) {
      createPageButton(i, pageNumberDiv, currentPage, loadPageData, container);
    }

    // between middle group and last page if needed
    if (end < totalPages - 2) {
      const ellipsis = document.createElement('span');
      ellipsis.textContent = '...';
      ellipsis.className = 'ellipsis';
      pageNumberDiv.append(ellipsis);
    }
  } else {
    for (let i = 1; i < totalPages - 1; i++) {
      createPageButton(i, pageNumberDiv, currentPage, loadPageData, container);
    }
  }

  // show the last page
  if (totalPages > 1) {
    createPageButton(totalPages - 1, pageNumberDiv, currentPage, loadPageData, container);
  }

  const startHit = currentPage * cardsPerPage + 1;
  const endHit = Math.min((currentPage + 1) * cardsPerPage, totalHits);

  const pageCounter = document.createElement('div');
  pageCounter.className = 'page-counter';
  const pageCounts = document.createElement('p');
  pageCounts.textContent = `${startHit}-${endHit} of ${totalHits} articles`;
  pageCounter.appendChild(pageCounts);

  pagination.append(pageNumberDiv, nextBtn);
  paginationContainer.append(pageCounter, pagination);
  return paginationContainer;
};

const loadCards = async (pageIndex, container) => {
  try {
    let cardsGrid = container.querySelector('.blog-cards-grid');
    if (cardsGrid) {
      cardsGrid.innerHTML = '<div class="loading">Loading articles...</div>';
    } else {
      cardsGrid = document.createElement('div');
      cardsGrid.classList.add('blog-cards-grid');
      cardsGrid.innerHTML = '<div class="loading">Loading articles...</div>';
      container.append(cardsGrid);
    }

    // const filterQuery = categoryFilter ? `newsResourceType:${categoryFilter}` : '';

    const { results } = await algoliaClient.search([
      {
        indexName: resourceIndexName,
        hitsPerPage: cardsPerPage,
        page: pageIndex,
      },
    ]);

    const hits = results[0].hits;
    const totalHits = results[0].nbHits;
    const totalPages = results[0].nbPages;

    cardsGrid.innerHTML = '';
    if (hits.length > 0) {
      cardsGrid.innerHTML = hits.map(createBlogCard).join('');
    } else {
      cardsGrid.innerHTML = '<div class="no-results"><h3>No articles found</h3></div>';
    }

    const existingPagination = container.querySelector('.pagination-bar');
    if (existingPagination) existingPagination.remove();

    if (totalPages > 1) {
      container.append(createPagination(pageIndex, totalHits, totalPages, loadCards, container));
    }
  } catch (error) {
    console.error('Error loading blog cards:', error);
    const cardsGrid = container.querySelector('.blog-cards-grid');
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

export default async function decorate(block) {
  try {
    const { appid, apikey, casestudiesindex } = await getAlgoliaConfig();

    algoliaClient = algoliasearch(appid, apikey);
    resourceIndexName = casestudiesindex;

    const firstRow = block.querySelector(':scope > div:first-child');
    if (firstRow) {
      const categoryElement = firstRow.querySelector('p');
      if (categoryElement) {
        categoryFilter = categoryElement.textContent.trim();
      }
    }

    const blogCardsContainer = document.createElement('div');
    blogCardsContainer.classList.add('blog-cards-container');

    block.innerHTML = '';

    block.append(blogCardsContainer);

    loadCards(0, blogCardsContainer);
  } catch (error) {
    console.error('Error initializing blog cards:', error);
    block.innerHTML = `
      <div class="error-message">
        <h3>Sorry, we encountered an error loading articles</h3>
        <p>Please try again later.</p>
      </div>
    `;
  }
}
