import { getMetadata } from '../../scripts/aem.js';
import { 
  buildFragmentBlockFromUrl, 
  createRelatedResourcesBlock, 
  createArticleStructure, 
  moveHeroBlocksToHeading, 
  buildBreadCrumb } from '../../utils/template-helper.js';

export async function loadEager(main, blocks = []) {
  const includeResourceBlock = getMetadata('resource-block')?.toLowerCase() === 'true';

  // add the heading container for hero blocks
  const headingContainer = document.createElement('div');
  headingContainer.classList.add('article-heading');

  // move hero blocks to the heading
  moveHeroBlocksToHeading(main, headingContainer);

  const fragmentUrl = getMetadata('sidebar');
  const aside = await buildFragmentBlockFromUrl(fragmentUrl);

  // build the article structure
  const articleContainer = createArticleStructure(main, headingContainer, aside);

  main.innerHTML = '';
  main.append(headingContainer);
  main.append(articleContainer);

  if (includeResourceBlock) {
    const title = getMetadata('resource-block-title');
    const resourceType = getMetadata('resource-type');

    const resourceContainer = await createRelatedResourcesBlock(title, resourceType, 'bg-color-grey-100');
    main.appendChild(resourceContainer);
  }

  main.classList.add('article');
  main.classList.add('case-study');

  await buildBreadCrumb('CASE STUDIES', '/case-studies');
}
