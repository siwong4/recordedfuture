import { buildButtonGroup } from '../../utils/helper.js';
/**
 * loads and decorates the exlore demo center main
 *  @param {Element} block
 */
export default function decorate(block) {
  const contentDiv = document.createElement('div');

  // move picture into div
  const pictureWrapper = document.createElement('div');
  pictureWrapper.classList.add('picture-wrapper');
  const pictureDiv = block.querySelector('p > picture');
  if (pictureDiv) {
    const pictureWrapper = document.createElement('div');
    pictureWrapper.classList.add('picture-wrapper');

    pictureWrapper.appendChild(pictureDiv);
    contentDiv.appendChild(pictureWrapper);
  }

  const buttonGroup = buildButtonGroup(block, 'button-group');
  if (buttonGroup) {
    contentDiv.appendChild(buttonGroup);
  }

  block.innerHTML = '';
  block.innerHTML = contentDiv.innerHTML;
}
