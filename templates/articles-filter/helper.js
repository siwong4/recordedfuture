/*
 * functions to support pagination and .accordion menu in articles-filter template
 */
import { fetchSvg } from '../../utils/helper.js';

export const cardsPerPage = 6;

const scrollIntoViewWithOffset = (element, offset) => {
  window.scrollTo({
    behavior: 'smooth',
    top: element.getBoundingClientRect().top - document.body.getBoundingClientRect().top - offset,
  });
};

export const createPageButton = (pageIndex, pageNumDiv, currentPage, loadPageData, container) => {
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

export const createPagination = (currentPage, totalHits, totalPages, loadPageData, container) => {
  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'pagination-bar';

  const pagination = document.createElement('div');
  pagination.className = 'pagination';

  if (totalPages > 1) {
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

    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-button';
    prevBtn.classList.add('back');
    prevBtn.setAttribute('aria-label', 'Previous page');
    const spanEl = document.createElement('span');

    prevBtn.append(spanEl);
    prevBtn.disabled = currentPage === 0;

    prevBtn.addEventListener('click', () => {
      loadPageData(currentPage - 1, container);
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

    pagination.append(prevBtn, pageNumberDiv, nextBtn);
  }

  const startHit = currentPage * cardsPerPage + 1;
  const endHit = Math.min((currentPage + 1) * cardsPerPage, totalHits);

  const pageCounter = document.createElement('div');
  pageCounter.className = 'page-counter';
  const pageCounts = document.createElement('p');
  pageCounts.textContent = `${startHit}-${endHit} of ${totalHits} articles`;
  pageCounter.appendChild(pageCounts);

  if (totalPages > 1) {
    paginationContainer.append(pageCounter, pagination);
  } else {
    paginationContainer.append(pageCounter);
  }

  return paginationContainer;
};

const closeOtherExpandedMenuItem = (accordionMenu, expandIcon) => {
  const expandedItems = accordionMenu.querySelectorAll('.filter-items.expanded');
  [...expandedItems].forEach((item) => {
    item.classList.remove('expanded');

    const menuItem = item.parentElement;
    const iconContainer = menuItem.querySelector('.title-icon');
    iconContainer.innerHTML = expandIcon;

    const titleButton = menuItem.querySelector('.title-button');
    titleButton.setAttribute('aria-expanded', 'false');
  });
};

const createTitleButton = (title, id, content, expandIcon, collapseIcon) => {
  const titleButton = document.createElement('button');
  const iconContainer = document.createElement('span');
  iconContainer.classList.add('title-icon');
  titleButton.classList.add('title-button');

  iconContainer.innerHTML = expandIcon;
  iconContainer.setAttribute('aria-hidden', true);
  titleButton.setAttribute('aria-expanded', 'false');

  const titleContainer = document.createElement('span');
  titleContainer.classList.add('title-button-label');
  titleContainer.setAttribute('id', title + '-' + id);
  titleContainer.innerText = title;

  titleButton.append(titleContainer, iconContainer);

  titleButton.addEventListener('click', () => {
    const isExpanded = titleButton.getAttribute('aria-expanded') === 'true';

    if (!isExpanded) {
      // close other expanded content
      closeOtherExpandedMenuItem(titleButton.parentElement.parentElement, expandIcon);

      content.classList.add('expanded');
      iconContainer.innerHTML = collapseIcon;
    } else {
      content.classList.remove('expanded');
      iconContainer.innerHTML = expandIcon;
    }

    titleButton.setAttribute('aria-expanded', !isExpanded);
  });

  return titleButton;
};

export const buildAccordionMenu = async (data) => {
  const ulMenu = document.createElement('ul');
  ulMenu.classList.add('accordion-menu');

  const expandIcon = await fetchSvg('add_2');
  const collapseIcon = await fetchSvg('remove');

  //for each filter
  data.forEach((item) => {
    const listItem = document.createElement('li');
    listItem.classList.add('menu');

    const subMenuItems = document.createElement('ul');
    subMenuItems.classList.add('filter-items');

    item.values.split(',').forEach((option, i) => {
      const subMenuItem = document.createElement('li');
      subMenuItem.classList.add('subMenuItem');

      const selectionLabel = document.createElement('label');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = option.trim();
      checkbox.value = item.filter + ':' + option.trim();
      subMenuItem.appendChild(checkbox);

      const checkmark = document.createElement('span');
      checkmark.classList.add('checkmark');

      const checkboxLabel = document.createElement('span');
      checkboxLabel.classList.add('label');
      checkboxLabel.innerText = option;
      selectionLabel.append(checkbox, checkmark, checkboxLabel);
      subMenuItem.appendChild(selectionLabel);

      subMenuItems.appendChild(subMenuItem);
    });

    const filterButton = createTitleButton(item.filterLabel, item.filter, subMenuItems, expandIcon, collapseIcon);
    listItem.append(filterButton, subMenuItems);

    ulMenu.append(listItem);
  });

  return ulMenu;
};
