import { buildBlock, decorateBlock, loadBlock } from '../../scripts/aem.js';
import { createCardItem, fetchSvg } from '../../utils/helper.js';

let cacheTabs = {};

const createDropdown = async (tabUrl) => {
  const dropdownWrapper = document.createElement('div');
  const dropdownTitleLabel = document.createElement('span');
  const dropdownButton = document.createElement('button');
  const dropdownLabel = document.createElement('span');
  dropdownTitleLabel.classList.add('dropdown-mobile-label');
  dropdownWrapper.classList.add('dropdown-wrapper');
  dropdownButton.classList.add('dropdown-toggle');
  dropdownLabel.classList.add('dropdown-label');
  dropdownTitleLabel.textContent = 'Show me';

  dropdownLabel.textContent = tabUrl;

  const dropdownIcon = await fetchSvg('chevron_down');
  const iconWrapper = document.createElement('span');
  iconWrapper.classList.add('icon-wrapper');
  iconWrapper.innerHTML = dropdownIcon;
  dropdownButton.append(dropdownLabel, iconWrapper);
  dropdownWrapper.append(dropdownTitleLabel, dropdownButton);

  return dropdownWrapper;
};

const updateCardGridClass = (block) => {
  const cardGrid = block.querySelector('.icon-card-grid');
  if (!cardGrid) return;

  const width = window.innerWidth;
  if (width <= 900) {
    cardGrid.className = 'icon-card-grid';
  } else if (width <= 1200) {
    cardGrid.className = 'icon-card-grid grid-2';
  } else {
    cardGrid.className = 'icon-card-grid grid-3';
  }
};

const createSelectorContainer = (tabItems) => {
  const selectorContainer = document.createElement('ul');
  selectorContainer.classList.add('selector-list');

  tabItems.forEach((item) => {
    const selection = document.createElement('li');
    selection.classList.add('selector-tabitem');
    selection.textContent = item;
    selection.ariaLabel = `Show ${selection.textContent}`;
    selectorContainer.append(selection);
  });

  return selectorContainer;
};

const createIndicator = () => {
  const activeIndicator = document.createElement('div');
  activeIndicator.classList.add('active-indicator');

  return activeIndicator;
};

const updateIndicator = (block) => {
  const indicator = block.querySelector('.active-indicator');
  const activeTab = block.querySelector('.selector-tabitem.active');
  if (!activeTab || !indicator) return;

  requestAnimationFrame(() => {
    const { left, width } = activeTab.getBoundingClientRect();
    const containerLeft = activeTab.parentElement.getBoundingClientRect().left;

    indicator.style.width = `${width}px`;
    if (!width) {
      indicator.style.display = 'none';
    } else {
      indicator.style.display = 'block';
      indicator.style.transform = `translateX(${left - containerLeft}px)`;
    }
  });
};

const handleResize = (block) => {
  updateCardGridClass(block);
  updateIndicator(block);
};

const updateJustifyContent = (container) => {
  const items = Array.from(container.children);
  const containerWidth = container.clientWidth;
  let totalWidth = 0;
  let rowCount = 1;

  for (const item of items) {
    totalWidth += item.offsetWidth + 16;
    if (totalWidth > containerWidth) {
      rowCount++;
      break;
    }
  }

  if (rowCount > 1) {
    container.style.justifyContent = 'center';
  } else {
    container.style.justifyContent = 'flex-start';
  }
};

const loadCardGrid = async (block, cardGridItems) => {
  const linkIcon = await fetchSvg('arrow_forward_blue');
  let cardGrid = block.querySelector('.icon-card-grid');

  if (!cardGrid) {
    cardGrid = buildBlock('icon-card-grid', '');
    block.appendChild(cardGrid);
    decorateBlock(cardGrid);
    loadBlock(cardGrid);
  }

  updateCardGridClass(block);

  const previousHeight = cardGrid.offsetHeight;
  cardGrid.style.minHeight = `${previousHeight}px`;
  cardGrid.style.opacity = '0';

  await new Promise((resolve) => setTimeout(resolve, 200));

  cardGrid.innerHTML = '';

  const items = await Promise.all(cardGridItems.map((item) => createCardItem(item, linkIcon)));

  items.forEach((item) => cardGrid.appendChild(item));

  requestAnimationFrame(() => {
    cardGrid.style.minHeight = '';
    cardGrid.style.opacity = '1';
    setTimeout(() => {
      const { offsetHeight } = cardGrid;
      cardGrid.style.minHeight = `${offsetHeight}px`;
      updateJustifyContent(cardGrid);
    }, 0);
  });
};

const fetchData = async (url) => {
  const response = await fetch(url);
  const { data } = await response.json();

  return data;
};

export default async function decorate(block) {
  const urlEl = block.querySelector('.selector div > p > a');
  if (!urlEl) return;

  const url = urlEl.href;

  block.firstElementChild.remove();

  let sheetUrl = '';

  const [tabItems, tabUrls] = [['All'], ['All']];

  const data = await fetchData(url);

  data.forEach((item) => {
    const itemName = item.Tab;
    tabItems.push(itemName);
    tabUrls.push(`${url}?sheet=${encodeURIComponent(itemName)}`);
  });

  if (tabUrls.length - 1) {
    cacheTabs['All'] = [];
    await Promise.all(
      tabUrls.slice(1).map(async (tabUrl) => {
        const tabData = await fetchData(tabUrl);
        cacheTabs[tabUrl] = tabData;
      })
    ).then(() => {
      // The fetch is returning sheet data in a random order
      // We need to match the order of tabUrls
      const allDataKeys = new Set();
      tabUrls.slice(1).forEach((tabUrl) => {
        (cacheTabs[tabUrl] || []).forEach((item) => {
          const uniqueKey = item.title;
          if (!allDataKeys.has(uniqueKey)) {
            allDataKeys.add(uniqueKey);
            cacheTabs['All'].push(item);
          }
        });
      });
    });

    const dropdownWrapper = await createDropdown(tabUrls[0]);
    const newSelector = createSelectorContainer(tabItems);
    const newIndicator = createIndicator();
    if (dropdownWrapper) {
      dropdownWrapper.append(newIndicator, newSelector);
    }
    block.append(dropdownWrapper);

    const selectorContainer = block.querySelector('.selector-list');
    const indicator = block.querySelector('.active-indicator');

    const iconWrapper = dropdownWrapper && dropdownWrapper.querySelector('.icon-wrapper');
    const dropdownLabel = dropdownWrapper && dropdownWrapper.querySelector('.dropdown-label');

    selectorContainer.querySelectorAll('.selector-tabitem').forEach((tab) => {
      const button = document.createElement('button');
      button.classList.add('selector-tabitem-btn');
      button.setAttribute('aria-label', tab.getAttribute('aria-label'));
      button.textContent = tab.textContent;

      const liWrapper = document.createElement('li');
      liWrapper.classList.add('selector-tabitem');

      tab.replaceWith(liWrapper);
      liWrapper.appendChild(button);

      button.addEventListener('click', async () => {
        const isAllTab = button.textContent === 'All';

        document.querySelectorAll('.selector-tabitem').forEach((t) => t.classList.remove('active'));
        liWrapper.classList.add('active');

        if (!isAllTab) sheetUrl = `${url}?sheet=${encodeURIComponent(button.textContent)}`;

        updateIndicator(block);

        if (selectorContainer.classList.contains('open')) {
          selectorContainer.classList.remove('open');
          if (dropdownLabel) dropdownLabel.textContent = button.textContent;
          if (iconWrapper) iconWrapper.style.transform = 'rotate(0deg)';
        }

        loadCardGrid(block, isAllTab ? cacheTabs['All'] : cacheTabs[sheetUrl]);
      });
    });

    if (selectorContainer) {
      const firstTab = selectorContainer.querySelector('.selector-tabitem');
      if (firstTab) {
        firstTab.classList.add('active');
        updateIndicator(block);
        loadCardGrid(block, cacheTabs['All']);
      }
    }

    window.addEventListener('resize', () => handleResize(block));

    const dropdownButton = document.querySelector('.dropdown-toggle');

    if (dropdownButton) {
      dropdownButton.addEventListener('click', () => {
        const isOpen = selectorContainer.classList.toggle('open');
        if (iconWrapper) iconWrapper.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
      });
    }
  }
}
