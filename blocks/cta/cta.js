import { buildButtonGroup } from '../../utils/helper.js';
/**
 * loads and decorates the cta block
 * @param {Element} block The cta block element
 */
export default function decorate(block) {
  const blockItems = block.children;

  [...blockItems].forEach((item) => {
    const ctaDiv = document.createElement('div');
    ctaDiv.classList.add('cta-content-container');

    // add background image if exists
    const images = item.querySelectorAll('picture > img');
    if (images.length > 0) {
      const imgSrc = images[0].src.split('?')[0];
      block.style.backgroundImage = `url(${imgSrc})`;
    }

    const textDiv = document.createElement('div');
    textDiv.classList.add('cta-text-container');
    const header = item.querySelectorAll('h1, h2');
    [...header].forEach((element) => {
      textDiv.appendChild(element);
    });

    // add description
    const descriptionDiv = document.createElement('div');
    descriptionDiv.classList.add('cta-desc');
    const pElements = item.getElementsByTagName('p');
    [...pElements].forEach((element) => {
      if (element.classList.contains('button-container')) {
        return;
      }
      descriptionDiv.appendChild(element);
    });
    textDiv.appendChild(descriptionDiv);

    // add title
    const title = item.querySelectorAll('h5, h6');
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('cta-title');
    [...title].forEach((element) => {
      titleDiv.appendChild(element);
    });
    textDiv.appendChild(titleDiv);

    ctaDiv.appendChild(textDiv);

    // add buttons
    const buttonGroup = buildButtonGroup(item, 'cta-button-group');
    if (buttonGroup) {
      ctaDiv.appendChild(buttonGroup);
    }
    ctaDiv.appendChild(buttonGroup);

    block.append(ctaDiv);
    item.remove();
  });
}
