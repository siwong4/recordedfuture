import { getMetadata } from '../../scripts/aem.js';

const classActive = 'active';
const sectionArray = ['book-demo', 'demo-center', 'free-tools'];

/*
 * add or remove class 'active' for selected item
 */
function toggleItem(item, show) {
  if (show) {
    item.classList.add(classActive);
  } else {
    item.classList.remove(classActive);
  }
}

/*
 * find the next active menu item
 */
function nextActiveItemIndex(main, selectedIndex) {
  const mainContent = main.querySelector('.main-content');
  const accordions = mainContent.querySelectorAll('.accordion');
  const activeItem = mainContent.querySelector('.accordion.active');
  const activeItemIndex = [...accordions].indexOf(activeItem);

  if (activeItemIndex === selectedIndex && selectedIndex < accordions.length - 1) {
    return selectedIndex + 1;
  }

  return selectedIndex;
}

/*
 * toggle fragement content on index page
 */
function toggleContent(main, i) {
  const fragmentCont = main.querySelector('.fragment-container');
  const fragments = fragmentCont.querySelectorAll('.fragment-wrapper');
  [...fragments].forEach((element, j) => {
    if (j === i) {
      toggleItem(element, true);
    } else {
      toggleItem(element, false);
    }
  });
}

/*
 * toggle main and mobile menus
 */
function toggleAllMenu(main, i) {
  toggleMobileNav(main, i);
  toggleNav(main, i);
}

/*
 * toggle all items under accordian
 */
function toggleChildAccordianElements(item, toActive) {
  toggleItem(item, toActive);
  const menuItem = toActive ? item.querySelector('.menu-item') : item.querySelector('.menu-item.active');
  if (menuItem) {
    toggleItem(menuItem, toActive);
  }
  const arrow = toActive ? item.querySelector('.arrow') : item.querySelector('.arrow.active');
  if (arrow) {
    toggleItem(arrow, toActive);
  }
}

/*
 * toggle accordion mobile menu
 */
function toggleMobileNav(main, i) {
  const mainContent = main.querySelector('.main-content');
  const menuItems = mainContent.querySelectorAll('.accordion');
  [...menuItems].forEach((item, j) => {
    if (j === i) {
      toggleChildAccordianElements(item, true);
    } else {
      toggleChildAccordianElements(item, false);
    }
  });
}

/*
 * toggle main menu
 */
function toggleNav(main, i) {
  const menuDiv = main.querySelector('.menu');
  const listItems = menuDiv.querySelectorAll(`li`);
  [...listItems].forEach((item, index) => {
    const menuItem = item.querySelector('.menu-item');
    if (index === i) {
      toggleItem(menuItem, true);
    } else {
      toggleItem(menuItem, false);
    }
  });
}

/*
 * build main menu
 */
function buildTabNav(headerDiv, main, activeIndex) {
  const menuType = getMetadata('menu-type');
  const indexUrl = getMetadata('index-url');
  const menuIndexStr = getMetadata('menu-index');
  const menuIndex = !!menuIndexStr ? parseInt(getMetadata('menu-index')) : null;

  const menuUl = headerDiv.querySelector('ul');
  menuUl.classList.add('nav-vertical-menu');
  const menuItems = menuUl.querySelectorAll('li');
  [...menuItems].forEach((item, i) => {
    const menuItemDiv = document.createElement('div');
    menuItemDiv.classList.add('menu-item');

    if (activeIndex === i) {
      menuItemDiv.classList.add(classActive);
    }

    const icon = item.querySelector('.icon');
    if (icon) {
      const image = icon.querySelector('img');
      image.classList.add('menu-icon-img');
      menuItemDiv.appendChild(icon);
    }

    const a = document.createElement('a');
    a.textContent = item.textContent.trim();
    a.setAttribute('aria-label', a.textContent);
    a.classList.add('cursor-pointer');

    // url on menu
    if (menuType === 'index') {
      a.href = '#' + sectionArray[i];
    } else {
      if (menuIndex === i) {
        a.href = 'javascript:void(0)';
      } else {
        // set to the index page with # and index
        a.href = window.location.protocol + '//' + window.location.host + indexUrl + '#' + sectionArray[i];
      }
    }

    menuItemDiv.appendChild(a);
    menuItemDiv.addEventListener('click', (e) => {
      toggleAllMenu(main, i);
      toggleContent(main, i);
    });

    item.innerHTML = '';
    item.appendChild(menuItemDiv);
  });
}

/*
 * build accordion mobile menu
 */
function buildMobileButton(menuWrapper, index, isActive) {
  const menuItems = menuWrapper.querySelectorAll('.menu-item');
  const selected = menuItems[index];

  const menuItem = document.createElement('div');
  menuItem.classList.add('accordion');
  if (isActive) {
    menuItem.classList.add(classActive);
  }
  menuItem.appendChild(selected.cloneNode(true));

  const arrowIcon = document.createElement('div');
  arrowIcon.classList.add('arrow');
  if (isActive) {
    arrowIcon.classList.add(classActive);
  }

  const ahref = menuItem.querySelector('a');
  const linkWrapper = document.createElement('div');
  linkWrapper.classList.add('link-wrapper');

  const linkText = document.createElement('div');
  linkText.classList.add('link-text');
  linkText.textContent = ahref.textContent;
  ahref.textContent = '';

  linkWrapper.appendChild(linkText);
  linkWrapper.appendChild(arrowIcon);

  ahref.appendChild(linkWrapper);

  return menuItem;
}

/*
 *  build the index page with left menu, fragment context, accordion mobile menu
 */
function buildIndexDemoPage(main, activeIndex) {
  const headerDiv = main.querySelector('[data-section="get-started-menu-header"] > div.default-content-wrapper');
  buildTabNav(headerDiv, main, activeIndex);

  const menuWrapper = document.createElement('div');
  menuWrapper.classList.add('menu');
  menuWrapper.appendChild(headerDiv);

  const mainContent = document.createElement('div');
  mainContent.classList.add('main-content');

  const fragementSection = main.querySelector('.fragment-container');
  if (fragementSection) {
    const updateSection = document.createElement('div');
    const fragments = fragementSection.querySelectorAll('.fragment-wrapper');
    [...fragments].forEach((item, i) => {
      const mobileButton = buildMobileButton(menuWrapper, i, i === activeIndex);
      item.classList.add('content-wrapper');
      if (i === activeIndex) {
        item.classList.add(classActive);
      }
      updateSection.appendChild(mobileButton);
      updateSection.appendChild(item);
    });
    fragementSection.innerHTML = updateSection.innerHTML;
    mainContent.appendChild(fragementSection);
  }

  // mobile accordian menu
  const buttons = mainContent.querySelectorAll('.accordion');
  [...buttons].forEach((button, i) => {
    button.onclick = () => {
      const nextActiveIndex = nextActiveItemIndex(main, i);
      toggleAllMenu(main, nextActiveIndex);
      toggleContent(main, nextActiveIndex);
    };
  });

  const getStartedWrapper = document.createElement('div');
  getStartedWrapper.classList.add('get-started-wrapper');
  getStartedWrapper.appendChild(menuWrapper);
  getStartedWrapper.appendChild(mainContent);
  main.innerHTML = '';
  main.appendChild(getStartedWrapper);
}

/*
 *  build the demo pages with main menu, context, accordion mobile menu
 *  Both main menu and accordion menu contains link to index page
 */
function buildDemoPage(main) {
  const menuIndex = getMetadata('menu-index');
  const activeIndex = menuIndex ? parseInt(menuIndex) : 0;

  const headerDiv = main.querySelector('[data-section="get-started-menu-header"] > div.default-content-wrapper');
  if (headerDiv) {
    buildTabNav(headerDiv, main, activeIndex);
  }

  const menuWrapper = document.createElement('div');
  menuWrapper.classList.add('menu');
  menuWrapper.appendChild(headerDiv);

  const mainContent = document.createElement('div');
  mainContent.classList.add('main-content');

  const mainContentWrapper = document.createElement('div');
  mainContentWrapper.classList.add('main-content-wrapper');
  mainContent.appendChild(mainContentWrapper);

  const contentContainer = document.createElement('div');
  contentContainer.classList.add('content-wrapper');
  contentContainer.classList.add(classActive);

  const contentHeader = main.querySelector('.section.content-header');
  if (contentHeader) {
    contentContainer.appendChild(contentHeader);
  }

  const hubspotSection = main.querySelector('.section.hubspot-embed-container');
  if (hubspotSection) {
    contentContainer.appendChild(hubspotSection);
  }

  const contents = main.querySelectorAll('.section.content');
  [...contents].forEach((item) => {
    contentContainer.appendChild(item);
  });

  // add  buttons
  const menuItems = menuWrapper.querySelectorAll('.menu-item');
  [...menuItems].forEach((item, i) => {
    const button = buildMobileButton(menuWrapper, i, i === activeIndex);
    mainContentWrapper.appendChild(button);
    if (i === activeIndex) {
      mainContentWrapper.appendChild(contentContainer);
    }
  });

  const buttons = mainContentWrapper.querySelectorAll('.accordion');
  [...buttons].forEach((button, i) => {
    button.onclick = () => {
      toggleAllMenu(main, i);
    };
  });

  const getStartedWrapper = document.createElement('div');
  getStartedWrapper.classList.add('get-started-wrapper');
  getStartedWrapper.appendChild(menuWrapper);
  getStartedWrapper.appendChild(mainContent);

  main.innerHTML = '';
  main.appendChild(getStartedWrapper);
}

// eslint-disable-next-line import/prefer-default-export
export function loadEager(main) {
  const menuType = getMetadata('menu-type');

  if (menuType === 'index') {
    // get the index from url to set the selected menu item. Otherwise, default to 0
    const currentUrl = window.location.href;
    const partName = currentUrl.includes('#') ? currentUrl.substring(currentUrl.indexOf('#') + 1) : sectionArray[0];
    const activeIndex = sectionArray.indexOf(partName);
    buildIndexDemoPage(main, activeIndex);
  } else {
    buildDemoPage(main);
  }
}
