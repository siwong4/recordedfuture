import { buildButtonGroup } from '../../utils/helper.js';
import { createOptimizedPicture } from '../../scripts/aem.js';
import { ulToButtonGroup } from './utility.js';

/**
 * loads and decorates the hero block
 * @param {Element} block The hero block element
 */
export default function decorate(block) {
  const contentDiv = block.querySelector('h1').parentElement;
  contentDiv.classList.add('inner-content-wrapper');
  contentDiv.parentElement.classList.add('inner-content-container');

  // header wrapper div
  const headerDiv = document.createElement('div');
  headerDiv.classList.add('header-wrapper');
  const headElements = block.querySelectorAll('h1');
  const oneHeading = headElements?.length === 1;

  [...headElements].forEach((element, i) => {
    if ((oneHeading && i === 0) || (!oneHeading && i === 1)) {
      element.classList.add('highlight');
    }
    headerDiv.appendChild(element);
  });
  contentDiv.prepend(headerDiv);

  // add subheader and paragraphy to desc-wrapper
  const descDiv = document.createElement('div');
  descDiv.classList.add('desc-wrapper');
  const subHeader = block.querySelector('h3');
  if (subHeader) {
    descDiv.appendChild(subHeader);
  }
  const pElements = block.getElementsByTagName('p');
  [...pElements].forEach((element) => {
    descDiv.appendChild(element);
  });
  contentDiv.appendChild(descDiv);
  // group buttons in p
  const buttonGroup = buildButtonGroup(descDiv, 'button-group');
  if (buttonGroup) {
    contentDiv.appendChild(buttonGroup);
  }

  // add buttons
  const buttonUl = block.querySelector('ul');
  if (buttonUl) {
    const ulButtonGroup = ulToButtonGroup(buttonUl, 'button-group');
    contentDiv.appendChild(ulButtonGroup);
    buttonUl.remove();
  }

  // add classes to pictures
  const pictures = block.querySelectorAll('picture');
  [...pictures].forEach((element, i) => {
    const img = element.querySelector('img');

    const pictureDiv = element.parentElement;
    pictureDiv.classList.add('hero-picture');
    if (i === 0) {
      pictureDiv.classList.add(pictures.length === 1 ? 'full' : 'lg');
      element.replaceWith(createOptimizedPicture(img.src, img.alt, true, [{ width: '2000' }]));
    } else {
      pictureDiv.classList.add('sm');
      element.replaceWith(createOptimizedPicture(img.src, img.alt, true, [{ width: '750' }]));
    }
  });
}
