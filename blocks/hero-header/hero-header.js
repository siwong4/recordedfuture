import { ulToButtonGroup } from '../hero/utility.js';
import { buildButtonGroup } from '../../utils/helper.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * loads and decorates the hero-header block
 * @param {Element} block The hero-header block element
 */
export default function decorate(block) {
  const contentDiv = block.querySelector('h1').parentElement;
  contentDiv.classList.add('inner-content-wrapper');
  contentDiv.parentElement.classList.add('inner-content-container');

  const headerDiv = document.createElement('div');
  headerDiv.classList.add('header-container');
  const headElements = block.querySelectorAll('h1');
  [...headElements].forEach((element, i) => {
    if (i === 0 && headElements.length > 1) {
      element.classList.add('tag-header');
    }
    headerDiv.appendChild(element);
  });
  contentDiv.prepend(headerDiv);

  const descDiv = document.createElement('div');
  descDiv.classList.add('desc-container');
  const subHeader = block.querySelector('h3');
  if (subHeader) {
    descDiv.appendChild(subHeader);
  }
  const isDarkMode = document.querySelector('.dark');
  const pElements = block.getElementsByTagName('p');
  [...pElements].forEach((element) => {
    descDiv.appendChild(element);
  });
  if (descDiv.children.length > 0) {
    contentDiv.appendChild(descDiv);
  }

  // group buttons in p
  const buttonGroup = buildButtonGroup(descDiv, 'button-group', isDarkMode);
  if (buttonGroup) {
    contentDiv.appendChild(buttonGroup);
  }

  // add buttons in ul
  const buttonUl = block.querySelector('ul');
  if (buttonUl) {
    const ulButtonGroup = ulToButtonGroup(buttonUl, 'button-group', isDarkMode);
    contentDiv.appendChild(ulButtonGroup);
    buttonUl.remove();
  }

  const pictures = block.querySelectorAll('picture');
  [...pictures].forEach((element, i) => {
    const pictureDiv = element.parentElement;
    pictureDiv.classList.add('hero-picture');
    pictureDiv.parentElement.classList.add('picture-container');
    if (i === 0) {
      pictureDiv.classList.add(pictures.length === 1 ? 'full' : 'lg');
    } else {
      pictureDiv.classList.add('sm');
    }

    const img = element.querySelector('img');
    if (img) {
      element.replaceWith(createOptimizedPicture(img.src, img.alt, true));
    }
  });
}
