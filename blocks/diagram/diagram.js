import { createCarouselNavigation, handleCarouselAction } from '../../utils/helper.js';

const createIndicator = (container) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'indicator');

  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', '/icons/diagram-indicators.svg#position-1');

  svg.appendChild(use);
  container.appendChild(svg);
};

const rotateIndicator = (position) => {
  const graphic = document.querySelector('.graphic');
  graphic.classList.remove('position-1', 'position-2', 'position-3', 'position-4');
  graphic.classList.add(`position-${position}`);

  const use = graphic.querySelector('.indicator use');
  use.setAttribute('href', `/icons/diagram-indicators.svg#position-${position}`);
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const card = entry.target;
      const position = card.dataset.position;

      if (entry.isIntersecting) {
        document.querySelectorAll('.diagram-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        rotateIndicator(position);
      }
    });
  },
  {
    rootMargin: '-40% 0px -40% 0px',
    threshold: 0.2,
  }
);

export default function decorate(block) {
  const section = document.querySelector('.diagram-container');
  const headingSection = section?.querySelector('.default-content-wrapper');
  if (headingSection) {
    const headingContainer = document.createElement('div');
    headingContainer.className = 'heading-container';

    const heading = headingSection.querySelector('h1');
    const subheading = headingSection.querySelector('p');

    if (heading) headingContainer.append(heading);
    if (subheading) headingContainer.append(subheading);

    //button container
    const btnContainer = document.createElement('div');
    btnContainer.className = 'buttons';
    const buttons = section.querySelectorAll('.button-container');
    buttons.forEach((button) => btnContainer.appendChild(button));

    headingSection.append(headingContainer, btnContainer);
  }

  const divs = Array.from(block.children);

  // .diagram-graphic
  if (divs.length > 0) {
    divs[0].classList.add('diagram-graphic');
    const graphic = divs[0].querySelector('div');
    if (graphic) {
      createIndicator(graphic);
      graphic.classList.add('graphic');
    }
  }

  // .diagram-card
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'diagram-cards';

  divs.slice(1).forEach((div, index) => {
    div.classList.add('diagram-card');
    div.setAttribute('data-position', index + 1);

    const nestedDivs = div.querySelectorAll('div');
    if (nestedDivs.length >= 2) {
      nestedDivs[0].classList.add('card-icon');
      nestedDivs[1].classList.add('card-body');
    }

    cardsContainer.appendChild(div);
  });

  while (block.children.length > 1) {
    block.removeChild(block.lastChild);
  }
  block.appendChild(cardsContainer);

  const cards = [...cardsContainer.querySelectorAll('.diagram-card')];
  if (cards.length > 0) {
    cards[0].classList.add('active');
    rotateIndicator(cards[0].dataset.position);
  }

  const pagination = createCarouselNavigation(cards, handleCarouselAction);
  block.appendChild(pagination);
  cards.forEach((card) => observer.observe(card));
}
