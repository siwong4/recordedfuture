import { createCardItem, createOrderedCardItem, fetchSvg } from '../../utils/helper.js';

export default async function decorate(block) {
  const linkIcon = await fetchSvg('east');
  const container = block.closest('.icon-card-grid-container');
  const isDarkMode = document.querySelector('.dark');

  if (isDarkMode) {
    container.classList.add('dark');
  }

  if (block.className.includes('ordered-list')) {
    const wrapper = document.createElement('div');
    wrapper.className = block.className;
    [...block.children].forEach((div, i) => {
      const orderNum = i + 1;
      const row = div.firstElementChild;
      const cardItem = createOrderedCardItem(row, orderNum, linkIcon);
      wrapper.append(cardItem);
    });
    block.replaceWith(wrapper);
  } else {
    const anchor = block.querySelector('a');
    if (!anchor) return;

    const { href } = anchor;
    const resp = await fetch(href);
    const { data: cardItems } = await resp.json();
    block.textContent = '';
    await Promise.all(
      cardItems.map(async (item) => {
        const cardItem = await createCardItem(item, linkIcon);
        return cardItem;
      })
    ).then((items) => {
      items.map((item) => block.append(item));
    });
  }
}
