import { createOptimizedPicture } from '../../scripts/aem.js';
import { handleCarouselAction, createCarouselNavigation, SWIPE_DIRECTION, swipeLeftRight } from '../../utils/helper.js';

export default function decorate(block) {
  const section = block.closest('.section');
  const backgroundContainer = document.createElement('div');
  backgroundContainer.classList.add('roll-cards-background');

  while (section.firstChild) {
    backgroundContainer.appendChild(section.firstChild);
  }

  section.appendChild(backgroundContainer);

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'roll-card';

    let link = null;

    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else {
        div.className = 'cards-card-body';
        const url = div.querySelector('a');

        if (url) {
          link = url.href;
        }

        const cardText = document.createElement('p');
        cardText.textContent = url.textContent;

        div.replaceChildren(cardText);
      }
    });

    if (link) {
      const cardContainer = document.createElement('div');
      const rollLink = document.createElement('a');
      rollLink.href = link;

      [...li.children].forEach((child) => cardContainer.append(child));

      rollLink.appendChild(cardContainer);

      li.replaceChildren(rollLink);
    }

    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) =>
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]))
  );
  block.textContent = '';
  const cards = [...ul.children];
  cards[0].classList.add('active');
  block.append(ul);

  // Setup Pagination Controls
  const carousel = createCarouselNavigation(cards, handleCarouselAction);

  // Add touch event handling for mobile swipe
  swipeLeftRight(block, (direction) => {
    if (direction === SWIPE_DIRECTION.RIGHT) {
      handleCarouselAction(cards, carousel, 1);
    } else if (direction === SWIPE_DIRECTION.LEFT) {
      handleCarouselAction(cards, carousel, -1);
    }
  });

  block.append(carousel);
}
