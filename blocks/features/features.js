import { scrollToContainer } from '../../utils/helper.js';

const classActive = 'active';

function buildHeaderDiv(headerDiv) {
  const header = document.createElement('div');
  header.classList.add('header-container');

  const headerContentDiv = document.createElement('div');
  headerContentDiv.classList.add('header-content-wrapper');
  header.appendChild(headerContentDiv);

  const headlineDiv = document.createElement('div');
  headlineDiv.classList.add('headline-wrapper');
  headerContentDiv.appendChild(headlineDiv);

  const headElements = headerDiv.querySelectorAll('h1');
  [...headElements].forEach((element) => {
    headlineDiv.appendChild(element);
  });

  const rightContentDiv = document.createElement('div');
  rightContentDiv.classList.add('right-content-wrapper');
  headerContentDiv.appendChild(rightContentDiv);

  const descWrapper = document.createElement('div');
  descWrapper.classList.add('desc-wrapper');
  const subHeader = headerDiv.querySelector('h3');
  if (subHeader) {
    descWrapper.appendChild(subHeader);
  }

  const pElements = headerDiv.getElementsByTagName('p');
  [...pElements].forEach((element) => {
    descWrapper.appendChild(element);
  });
  rightContentDiv.appendChild(descWrapper);
  return header;
}

function toggleItem(item, show) {
  if (show) {
    item.classList.add(classActive);
  } else if (item.classList.contains(classActive)) {
    item.classList.remove(classActive);
  }
}

function toggleAllMenu(block, i) {
  toggleMobileNav(block, i);
  toggleNav(block, i);
}

function toggleMenuItem(element, i) {
  const activeItem = element.querySelector('.menu-item.active');
  const menuItems = element.querySelectorAll('.menu-item');
  [...menuItems].forEach((item, j) => {
    if (item === activeItem) {
      toggleItem(item, false);
      const accordion = item.querySelector('.accordion');
      if (accordion) {
        toggleItem(accordion, false);
      }
    }
    if (j === i) {
      toggleItem(item, true);
      const accordion = item.querySelector('.accordion');
      if (accordion) {
        toggleItem(accordion, true);
      }
    }
  });
}

function toggleMobileNav(block, i) {
  const mainContent = block.querySelector('.main-content');
  toggleMenuItem(mainContent, i);
}

function toggleContent(block, i) {
  const mainContent = block.querySelector('.main-content');
  const contentPanels = mainContent.querySelectorAll('.vertical-pane');
  const activeItem = mainContent.querySelector('.vertical-pane.active');
  [...contentPanels].forEach((element, j) => {
    if (element === activeItem) {
      toggleItem(element, false);
    }
    if (j === i) {
      toggleItem(element, true);
    }
  });
}

function toggleNav(block, i) {
  const menuDiv = block.querySelector('.tabs-menu');
  const active = menuDiv.querySelector(`li.${classActive}`);
  const menuItems = menuDiv.querySelectorAll(`li`);
  [...menuItems].forEach((item, index) => {
    if (item === active) {
      toggleItem(item, false);
    }
    if (index === i) {
      toggleItem(item, true);
    }
  });
  toggleMenuItem(menuDiv, i);
}

function buildTabNav(block) {
  const ul = document.createElement('ul');
  const titles = block.querySelectorAll('div:not(:first-child) > div:first-child');

  [...titles].forEach((title, i) => {
    const li = document.createElement('li');
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('menu-item');

    const a = document.createElement('a');
    a.textContent = title.textContent.trim();
    a.setAttribute('aria-label', a.textContent);
    if (title.children.length > 0) {
      a.classList.add('cursor-pointer');
      a.href = '#';
      a.addEventListener('click', (e) => {
        e.preventDefault();
        toggleContent(block, i);
        scrollToContainer(block);
        toggleAllMenu(block, i);
      });
    }
    itemDiv.appendChild(a);
    li.appendChild(itemDiv);
    ul.appendChild(li);
  });

  // set 1st item active
  const liElement = ul.querySelector('li');
  liElement.classList.add(classActive);
  liElement.querySelector('.menu-item').classList.add(classActive);

  return ul;
}

function removeActive(menuWrapper) {
  const activeItem = menuWrapper.querySelector('li.active');
  if (activeItem) {
    toggleItem(activeItem, false);
  }
}

function makeActive(menuWrapper) {
  const activeItem = menuWrapper.querySelector('.menu-item.active');
  if (activeItem) {
    toggleItem(activeItem.parentElement, true);
  }
}

/**
 * loads and decorates the features block with vertical tab menu
 * @param {Element} block The features block element
 */

export default function decorate(block) {
  // build tab menu
  const ul = buildTabNav(block);
  ul.classList.add('nav-verticial-tabs');

  const menuWrapper = document.createElement('div');
  menuWrapper.classList.add('tabs-menu');
  menuWrapper.appendChild(ul);

  const mainContent = document.createElement('div');
  mainContent.classList.add('main-content');

  const tabWrapper = document.createElement('div');
  tabWrapper.classList.add('tabs-wrapper');
  tabWrapper.appendChild(menuWrapper);
  tabWrapper.appendChild(mainContent);

  [...block.children].forEach((row, i) => {
    // first row is for header, start from second row
    if (i) {
      const tabPane = document.createElement('div');
      tabPane.classList.add('vertical-pane');

      // mobile accordion heading
      const menuItem = document.createElement('div');
      menuItem.classList.add('menu-item');
      const button = document.createElement('button');
      button.classList.add('accordion');
      const div = row.querySelector('div');
      button.innerHTML = `${div.textContent}`;
      menuItem.appendChild(button);

      const picture = row.querySelector('picture');
      if (picture) {
        tabPane.appendChild(picture);
      }

      const featureContent = row.lastElementChild;
      const headerElement = featureContent.querySelector('h3');
      const contentList = [];
      let contentElement = headerElement.nextElementSibling;

      while (contentElement) {
        contentList.push(contentElement);
        contentElement = contentElement.nextElementSibling;
      }

      if (headerElement) {
        tabPane.appendChild(headerElement);
      }

      const contentDiv = document.createElement('div');
      contentDiv.classList.add('tab-content');

      [...contentList].forEach((element) => {
        if (element.textContent.trim() === '') return;
        contentDiv.appendChild(element);
      });

      tabPane.appendChild(contentDiv);

      mainContent.appendChild(menuItem);
      mainContent.appendChild(tabPane);
    }
  });

  // set first tab active
  const firstTabPane = mainContent.querySelector('.vertical-pane');
  firstTabPane.classList.add(classActive);

  const firstButton = mainContent.querySelector('.accordion');
  firstButton.classList.add(classActive);
  firstButton.parentElement.classList.add(classActive);

  // get header from 1st row
  const firstDevWithHeader = block.querySelector('div');
  const headerDev = buildHeaderDiv(firstDevWithHeader);

  // tab menu header
  const tabHeader = firstDevWithHeader.querySelector('h4');
  if (tabHeader) {
    const tabMenuHeader = document.createElement('div');
    tabMenuHeader.classList.add('tag-menu-title');
    tabMenuHeader.appendChild(tabHeader);
    menuWrapper.prepend(tabMenuHeader);
  }

  const buttons = mainContent.querySelectorAll('.accordion');
  [...buttons].forEach((button, i) => {
    button.onclick = () => {
      toggleAllMenu(block, i);
      toggleContent(block, i);
    };
  });

  menuWrapper.addEventListener('mouseover', (event) => {
    removeActive(menuWrapper);
  });

  menuWrapper.addEventListener('mouseleave', (event) => {
    makeActive(menuWrapper);
    makeActive(mainContent);
  });

  block.textContent = '';
  block.appendChild(headerDev);
  block.appendChild(tabWrapper);
}
