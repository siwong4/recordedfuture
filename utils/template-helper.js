import { buildBlock, decorateBlock, loadBlock } from '../scripts/aem.js';

const HERO_BLOCKS = ['hero', 'hero-header'];

/**
 * build section
 *
 * @param classNames list of className
 * @param {Element} innerHTML innerHTMl
 *
 * @return {HTMLElement}
 */
const createSection = (classNames, innerHTML = '') => {
  const section = document.createElement('div');
  section.classList.add('section', ...classNames);
  section.innerHTML = innerHTML;
  return section;
};

/**
 * build a Fragment block with URL
 *
 * @param {string} fragmentUrl url to document for fragment block
 *
 * @return {HTMLElement}
 */
const buildFragmentBlockFromUrl = async (fragmentUrl) => {
  if (fragmentUrl === null || fragmentUrl.length === 0) return null;

  const section = createSection(['fragment-container']);

  // build block content
  const block = document.createElement('div');
  const fragmentBlock = buildBlock('fragment', '');
  fragmentBlock.innerHTML = `
    <div>
       <p><a href="${fragmentUrl}"  target="_blank">${fragmentUrl}</a></p>
    </div>
  `;

  block.appendChild(fragmentBlock);
  await decorateBlock(fragmentBlock);
  section.appendChild(block);

  return section;
};

/**
 * build a related resource block
 *
 * @param {string} title block title
 * @param {string} resourceType resource type used to retrieve record
 * @param {string} bgColor background color of the block
 *
 * @return {HTMLElement}
 */
const createRelatedResourcesBlock = async (title, resourceType, bgColor) => {
  const section = createSection(['related-resources-container', bgColor]);

  // create default content for title
  const defaultContent = document.createElement('div');
  defaultContent.classList.add('default-content-wrapper');
  const titleHeader = document.createElement('h2');
  titleHeader.innerText = title;
  defaultContent.append(titleHeader);

  // build block content
  const block = document.createElement('div');
  const relatedResources = buildBlock('related-resources', '');
  relatedResources.innerHTML = `
    <div>
      <p>${resourceType}</p>
    </div>
    <div>
      <p>${resourceType}</p>
    </div>
    <div>
      <p>${resourceType}</p>
    </div>
  `;

  block.appendChild(relatedResources);
  relatedResources.classList.add('v2');
  relatedResources.classList.add('no-tags');
  relatedResources.classList.add('show-date');

  decorateBlock(relatedResources);
  await loadBlock(relatedResources);
  section.append(defaultContent, block);

  return section;
};

const buildBreadCrumb = async (blogMainTitle, url) => {
  const wrapper = document.createElement('div');

  const breadCrumb = buildBlock('return-nav', '');
  breadCrumb.innerHTML = `<div><a href="${url}">${blogMainTitle}</a></div>`;

  wrapper.appendChild(breadCrumb);

  const article = document.querySelector('main.article');
  if (article) {
    article.prepend(wrapper);
    decorateBlock(breadCrumb);
    await loadBlock(breadCrumb);
  }
};

const moveHeroBlocksToHeading = (main, headingContainer) => {
  const sections = [...main.querySelectorAll('.section')];
  const heroSections = [];

  sections.forEach((section) => {
    HERO_BLOCKS.forEach((heroClass) => {
      if (section.querySelector(`.${heroClass}`)) {
        heroSections.push(section);
      }
    });
  });

  heroSections.forEach((section) => {
    headingContainer.appendChild(section.cloneNode(true));
    section.remove();
  });

  return heroSections;
};

const createArticleStructure = (main, headingContainer, authorBioBlock, sidebarBlock) => {
  // sidebar
  const aside = document.createElement('div');
  aside.classList.add('aside');

  if (authorBioBlock instanceof Node) {
    aside.appendChild(authorBioBlock);
  }
  if (sidebarBlock instanceof Node) {
    aside.appendChild(sidebarBlock);
  }

  // aside.appendChild(authorBioBlock);
  // sidebarBlock && aside.appendChild(sidebarBlock);

  // article content container
  const articleBody = document.createElement('article');
  articleBody.classList.add('article-content');

  // move remaining content to the article body
  [...main.children].forEach((block) => {
    articleBody.appendChild(block);
  });

  // article container and structure
  const articleContainer = createSection(['article-container']);
  const articleWrapper = document.createElement('div');
  articleWrapper.classList.add('article-wrapper');

  articleContainer.append(articleWrapper);
  articleWrapper.append(aside, articleBody);

  return articleContainer;
};

export {
  createSection,
  createRelatedResourcesBlock,
  buildFragmentBlockFromUrl,
  buildBreadCrumb,
  moveHeroBlocksToHeading,
  createArticleStructure,
};
