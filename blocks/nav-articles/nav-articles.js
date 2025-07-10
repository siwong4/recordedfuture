import { algoliasearch } from 'https://cdn.jsdelivr.net/npm/algoliasearch@5.20.1/+esm';
import { getAlgoliaConfig, formatDate, determineFilterType } from '../../utils/helper.js';
import { optimizeAlgoliaImg } from '../../scripts/aem.js';

let algoliaClient = null;

const decorateArticle = (hit, block) => {
  const article = {
    thumbnail: hit.thumb || hit.image || '/assets/card-placeholder.png',
    title: hit.title || '',
    date: hit.date || '',
    link: hit.extUrl || hit.slug || '#',
  };

  const articleWrapper = document.createElement('a');
  let articleLink = null;

  if (hit.extUrl) {
    articleLink = hit.extUrl;
  } else if (hit.slug) {
    articleLink = hit.slug;
  } else {
    articleLink = '#';
  }

  articleWrapper.href = articleLink;
  articleWrapper.classList.add('article');

  if (article.thumbnail) {
    const thumbnailWrapper = document.createElement('div');
    thumbnailWrapper.classList.add('thumbnail-wrapper');

    const thumbnail = optimizeAlgoliaImg(article.thumbnail, `Link to ${article.title}`);
    thumbnailWrapper.append(thumbnail);
    articleWrapper.append(thumbnailWrapper);
  }

  if (article.date) {
    const publishDate = document.createElement('p');
    publishDate.classList.add('article-publish-date');
    publishDate.innerText = formatDate(article.date);
    articleWrapper.append(publishDate);
  }

  if (article.title) {
    const title = document.createElement('h6');
    title.classList.add('article-title');
    title.innerText = article.title;
    articleWrapper.append(title);
  }

  block.append(articleWrapper);
};

const loadArticles = async (block, articlePaths, headingText) => {
  try {
    block.innerHTML = '<div class="loading">Loading articles...</div>';

    // track URLs to prevent duplicates
    const usedUrls = new Set();
    const results = [];

    for (const path of articlePaths) {
      const filterInfo = determineFilterType(path);
      if (filterInfo.type === 'slug' || filterInfo.type === 'extUrl') {
        const request = {
          indexName: 'resource_index_sort_date',
          hitsPerPage: 1,
          filters: filterInfo.filter,
        };

        const response = await algoliaClient.search([request]);
        if (response.results[0].hits.length > 0) {
          const hit = response.results[0].hits[0];
          const url = hit.extUrl || hit.slug;

          // skip if article already included
          if (!usedUrls.has(url)) {
            usedUrls.add(url);
            results.push({ hits: [hit] });
          }
        }
      }
      // fetch & filter by resource type
      else if (filterInfo.type === 'resourceType') {
        const request = {
          indexName: 'resource_index_sort_date',
          hitsPerPage: 10,
          filters: 'newsResourceType:research',
        };

        const response = await algoliaClient.search([request]);
        if (response.results[0].hits.length > 0) {
          for (const hit of response.results[0].hits) {
            const url = hit.extUrl || hit.slug;
            if (!usedUrls.has(url)) {
              usedUrls.add(url);
              results.push({ hits: [hit] });
              break;
            }
          }
        }
      }
    }

    block.innerHTML = '';

    if (headingText) {
      const headingElement = document.createElement('p');
      headingElement.classList.add('title');
      headingElement.textContent = headingText;
      block.appendChild(headingElement);
    }

    const articlesContainer = document.createElement('div');
    articlesContainer.classList.add('articles');
    block.appendChild(articlesContainer);

    // create left and right columns
    const leftColumn = document.createElement('div');
    leftColumn.classList.add('column', 'left-column');
    const rightColumn = document.createElement('div');
    rightColumn.classList.add('column', 'right-column');

    articlesContainer.append(leftColumn, rightColumn);

    let foundArticles = false;

    results.forEach((result, index) => {
      if (result.hits.length > 0) {
        const targetColumn = index === 0 ? leftColumn : rightColumn;
        decorateArticle(result.hits[0], targetColumn);
        foundArticles = true;
      }
    });

    if (!foundArticles) {
      const titleElement = block.querySelector('.title');
      if (titleElement) {
        block.innerHTML = '';
        block.appendChild(titleElement);
      }

      block.innerHTML += '<div class="no-results"><h3>No articles found</h3></div>';
    }
  } catch (error) {
    console.error('Error loading articles:', error);

    const headingElement = block.querySelector('.title');
    block.innerHTML = '';
    if (headingElement) {
      block.appendChild(headingElement);
    }

    block.innerHTML += `
      <div class="error-message">
        <h3>Sorry, we encountered an error loading the articles</h3>
        <p>Please try again later.</p>
      </div>
    `;
  }
};

export default async function decorate(block) {
  try {
    const articlePaths = [];
    const rows = block.querySelectorAll(':scope > div');

    // get article paths
    for (let i = 0; i < 3; i++) {
      if (rows[i]) {
        const pathElement = rows[i].querySelector('p');
        if (pathElement && pathElement.textContent.trim()) {
          articlePaths.push(pathElement.textContent.trim());
        }
      }
    }

    let headingText = '';
    const headingRow = rows[3];
    if (headingRow) {
      const heading = headingRow.querySelector('p');
      if (heading) {
        heading.classList.add('title');
        headingText = heading.textContent;
      }
    }

    const { appid, apikey } = await getAlgoliaConfig();
    algoliaClient = algoliasearch(appid, apikey);

    await loadArticles(block, articlePaths, headingText);
  } catch (error) {
    console.error('Error loading articles:', error);
    block.innerHTML = `
      <div class="error-message">
        <h3>Sorry, we encountered an error loading the content</h3>
        <p>Please try again later.</p>
      </div>
    `;
  }
}
