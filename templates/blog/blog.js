import { buildBlock, decorateBlock, getMetadata, loadBlock } from '../../scripts/aem.js';
import { loadFragment } from '../../blocks/fragment/fragment.js';
import { formatDate } from '../../utils/helper.js';
import {
  createSection,
  createRelatedResourcesBlock,
  buildBreadCrumb,
  moveHeroBlocksToHeading,
  createArticleStructure,
} from '../../utils/template-helper.js';
import { applyMobileListCollapse } from '../../blocks/summary/summary.js';

async function createAuthorBioBlock() {
  const authorName = getMetadata('author');
  const publishedDate = getMetadata('published-date');
  const categories = getMetadata('category') || '';

  if (!authorName || !publishedDate) return '';

  const section = createSection(['author-bio-container']);
  const block = document.createElement('div');
  block.classList.add('author-bio-wrapper');
  const authorBio = document.createElement('div');
  authorBio.classList.add('author-bio');
  authorBio.innerHTML = `
    <div class="author-detail">
      <div class="author-wrapper">
        <div class="date-wrapper">
          <span><p class="prefix">PUBLISHED ON ${formatDate(publishedDate).toUpperCase()}</p></span>
        </div>
        <p class="name">${authorName}</p>
      </div>
    </div>
  `;

  // add tags
  if (categories.length > 0) {
    const tagsWrapper = document.createElement('div');
    tagsWrapper.classList.add('tags');

    categories.split(',').forEach((tagLabel) => {
      const tag = document.createElement('p');
      tag.classList.add('tag');
      tag.innerText = tagLabel;
      tagsWrapper.append(tag);
    });
    const authorWrapper = authorBio.querySelector('.author-wrapper');
    authorWrapper.appendChild(tagsWrapper);
  }

  block.appendChild(authorBio);
  section.appendChild(block);

  return section;
}

async function createArticleSidebarBlock() {
  const sidebarPath = getMetadata('sidebar');

  if (!sidebarPath) return;

  const fragment = await loadFragment(sidebarPath);
  const section = fragment.querySelector('.summary-container');
  window.addEventListener('resize', () => {
    applyMobileListCollapse(section);
  });
  return fragment;
}

export async function loadEager(main, blocks = []) {
  const includeResourceBlock = getMetadata('resource-block')?.toLowerCase() === 'true';

  // add the heading container for hero blocks
  const headingContainer = document.createElement('div');
  headingContainer.classList.add('article-heading');

  // move hero blocks to the heading
  moveHeroBlocksToHeading(main, headingContainer);

  // create author bio
  const authorBioBlock = await createAuthorBioBlock();

  // create article sidebar fragment
  const sidebarBlock = await createArticleSidebarBlock();

  // build the article structure
  const articleContainer = createArticleStructure(main, headingContainer, authorBioBlock, sidebarBlock);

  main.innerHTML = '';
  main.append(headingContainer);
  main.append(articleContainer);

  if (includeResourceBlock) {
    const title = getMetadata('resource-block-title');
    const resourceType = getMetadata('resource-type');

    const resourceContainer = await createRelatedResourcesBlock(title, resourceType, 'bg-color-grey-100');
    resourceContainer.classList.add('no-filter');
    main.appendChild(resourceContainer);
  }

  main.classList.add('article');
  await buildBreadCrumb('Recorded Future Blog', '/blog');
}
