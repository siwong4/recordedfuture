import { loadFragment } from '../../blocks/fragment/fragment.js';
import { buildBlock, decorateBlock, getMetadata, loadBlock } from '../../scripts/aem.js';

const NEXT_STEPS_PATH = '/fragments/next-steps';

const FOOTER_BLOCKS = ['features', 'next-steps' ];

const createSection = (classNames, innerHTML = '') => {
  const section = document.createElement('div');
  section.classList.add('section', ...classNames);
  section.innerHTML = innerHTML;
  return section;
};

const createPlatformFeaturesBlock = async (category, page) => {
  const section = createSection(['bg-color-blue-50', 'icon-card-grid-container'], '<h1>Explore more platform features.</h1>');
  const block = document.createElement('div');

  const iconCardGrid = buildBlock('icon-card-grid', '');
  iconCardGrid.innerHTML = `
    <div>
      <p><a href="/fragments/${category}/${page}-features.json"></a></p>
    </div>
  `;
  iconCardGrid.classList.add('grid-3');
  block.appendChild(iconCardGrid);
  decorateBlock(iconCardGrid);
  await loadBlock(iconCardGrid);
  section.appendChild(block);

  return section;
};

const createNextStepsBlock = async (isConnectingBlock) => {
  const fragment = await loadFragment(NEXT_STEPS_PATH);
  const nextSteps = fragment.firstElementChild;

  if (isConnectingBlock) {
    nextSteps.classList.add('border-full');
  }

  return nextSteps;
};

const createPromiseBlock = (hasBlock, createFn) => {
  return hasBlock ? createFn() : Promise.resolve(null);
};

export async function loadEager(main, blocks = []) {
  const page = getMetadata('page');
  const category = getMetadata('category');

  const blockFlags = FOOTER_BLOCKS.reduce((acc, blockName) => {
    acc[blockName] = blocks.includes(blockName);
    return acc;
  }, {});

  const blockPromises = [createPromiseBlock(blockFlags.features, () => createPlatformFeaturesBlock(category, page)), createPromiseBlock(blockFlags['next-steps'], () => createNextStepsBlock(blockFlags.features))];

  const results = await Promise.all(blockPromises);

  main.append(...results.filter(Boolean));
}
