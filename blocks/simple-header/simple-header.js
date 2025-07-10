import { ulToButtonGroup } from '../hero/utility.js';
import { buildButtonGroup } from '../../utils/helper.js';
/**
 * loads and decorates the simple-header block
 * @param {Element} block The simple-header block element
 */
export default function decorate(block) {
  const headerDiv = document.createElement('div');
  headerDiv.classList.add('header-wrapper');
  const headElements = block.querySelectorAll('h1');
  [...headElements].forEach((element, i) => {
    headerDiv.appendChild(element);
  });

  const rightDiv = document.createElement('div');
  rightDiv.classList.add('right-content');

  const descWrapper = document.createElement('div');
  descWrapper.classList.add('desc-wrapper');
  const subHeader = block.querySelector('h3');
  if (subHeader) {
    descWrapper.appendChild(subHeader);
  }

  const pElements = block.getElementsByTagName('p');
  [...pElements].forEach((element) => {
    descWrapper.appendChild(element);
  });
  rightDiv.appendChild(descWrapper);

  // group buttons in p
  const buttonGroup = buildButtonGroup(descWrapper, 'button-group');
  if (buttonGroup) {
    rightDiv.appendChild(buttonGroup);
  }

  // add buttons in ul
  const buttonUl = block.querySelector('ul');
  if (buttonUl) {
    const buttonGroup = ulToButtonGroup(buttonUl, 'button-group');
    rightDiv.appendChild(buttonGroup);
    buttonUl.remove();
  }

  block.innerHTML = '';
  block.appendChild(headerDiv);
  block.appendChild(rightDiv);
}
