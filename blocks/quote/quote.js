import { createOptimizedPicture } from '../../scripts/aem.js';
import { handleCarouselAction, createCarouselNavigation, SWIPE_DIRECTION, swipeLeftRight } from '../../utils/helper.js';

function observerCallback(entries, observer) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // fade in observed elements once in view
      entry.target.style.opacity = 1;
      observer.unobserve(entry.target);
    }
  });
}

const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.4,
};

const observer = new IntersectionObserver(observerCallback, observerOptions);

export default function decorate(block) {
  // Reveal on scroll
  observer.observe(block);

  // Setup Quote Cards
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'quote-card';
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      let quote = div.querySelector('h1, h2');
      if (quote) {
        div.className = 'card-quote';
        quote.className = 'quotation';

        quote.insertAdjacentHTML('beforebegin', '<div class="quotation-marker"></div>');

        let credit = document.createElement('div');
        credit.classList.add('credit');
        let nextSibling = quote.nextElementSibling;
        while (nextSibling) {
          let el = nextSibling;
          el.classList.add('credit-item');
          nextSibling = nextSibling.nextElementSibling;
          credit.appendChild(el);
        }

        const logo = credit.querySelector('picture');
        if (!logo) {
          credit.classList.add('no-border');
        }

        quote.after(credit);
      } else div.className = 'card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) =>
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]))
  );
  block.textContent = '';
  const cards = [...ul.children];
  cards[0].classList.add('active');
  block.append(ul);

  if (cards.length > 1) {
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

    const indicators = carousel.querySelectorAll('.indicators > li');
    const prevButton = carousel.querySelector('.previous');
    const nextButton = carousel.querySelector('.next');

    cards.forEach((card, index) => {
      card.addEventListener('focusin', () => {
        const activeIndicator = carousel.querySelector('.indicators > li.active');

        cards.forEach((card) => card.classList.remove('active'));
        if (activeIndicator) activeIndicator.classList.remove('active');

        card.classList.add('active');
        indicators[index].classList.add('active');

        prevButton.disabled = index === 0;
        nextButton.disabled = index === indicators.length - 1;

        requestAnimationFrame(() => {
          card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        });
      });
    });
  }
}
