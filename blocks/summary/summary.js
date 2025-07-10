import { buildBlock, decorateBlock, loadBlock } from '../../scripts/aem.js';

export function applyMobileListCollapse(section) {
  const content = section.querySelector('.default-content-wrapper');
  const isMobile = window.innerWidth < 1024;

  if (!content) return;

  const allH4s = Array.from(content.querySelectorAll('h4'));
  allH4s.forEach((h4) => h4.style.removeProperty('display'));
  allH4s.forEach((h4) => {
    const ul = h4.nextElementSibling;
    if (ul && ul.tagName === 'UL') {
      ul.style.removeProperty('display');
    }
  });

  const existingBtn = content.querySelector('.show-more-btn');
  if (existingBtn) existingBtn.remove();

  if (isMobile) {
    const listGroups = [];

    for (let i = 0; i < allH4s.length; i++) {
      const h4 = allH4s[i];
      const ul = h4.nextElementSibling;
      if (ul && ul.tagName === 'UL') {
        listGroups.push({ h4, ul });
      }
    }

    if (listGroups.length > 3) {
      listGroups.slice(3).forEach(({ h4, ul }) => {
        h4.style.display = 'none';
        ul.style.display = 'none';
      });

      const showMoreBtn = document.createElement('button');
      showMoreBtn.classList.add('show-more-btn');
      showMoreBtn.textContent = 'Show more';
      showMoreBtn.setAttribute('aria-label', 'Show more list items');

      let expanded = false;

      showMoreBtn.addEventListener('click', () => {
        expanded = !expanded;

        listGroups.slice(3).forEach(({ h4, ul }) => {
          h4.style.display = expanded ? '' : 'none';
          ul.style.display = expanded ? '' : 'none';
        });

        if (expanded) {
          showMoreBtn.textContent = 'Show less';
          showMoreBtn.setAttribute('aria-label', 'Show less list items');
        } else {
          showMoreBtn.textContent = 'Show more';
          showMoreBtn.setAttribute('aria-label', 'Show more list items');
        }
      });

      content.appendChild(showMoreBtn);
    }
  }
}

export default async function decorate(block) {
  const section = document.querySelector('.summary-container');
  const metricsLink = block.querySelector('.button-container');

  if (metricsLink) {
    const metrics = buildBlock('metrics', metricsLink);
    block.replaceWith(metrics);
    decorateBlock(metrics);
    loadBlock(metrics);
  } else {
    const hasHeading = !!block.querySelector('h1, h2, h3, h4, h5, h6');

    if (!hasHeading) {
      const title = document.createElement('h5');
      title.classList.add('summary-title');
      title.textContent = 'Summary';
      block.prepend(title);
      block.classList.add('no-title');
    }
  }

  applyMobileListCollapse(section);

  window.addEventListener('resize', () => {
    applyMobileListCollapse(section);
  });
}
