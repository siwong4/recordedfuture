import { fetchSvg } from '../../utils/helper.js';

/**
 * loads and decorates the picture block with caption
 * @param {Element} block The picture-caption block element
 */
export default async function decorate(block) {
  const pictureCaption = document.createElement('div');

  // move picture into div
  const pictureDiv = block.querySelector('div > picture');
  if (pictureDiv) {
    pictureDiv.parentElement.classList.add('picture-wrapper');
    pictureCaption.appendChild(pictureDiv.parentElement);
  }

  const buttonLink = block.querySelector('p > a');
  if (buttonLink) {
    const linkIcon = await fetchSvg('link');
    buttonLink.className = 'caption-link-button';
    buttonLink.innerHTML = `${linkIcon}${buttonLink.textContent}`;

    const linkWrapper = document.createElement('div');
    linkWrapper.classList.add('link-wrapper');
    linkWrapper.appendChild(buttonLink);

    const buttonContainer = block.querySelector('.button-container');
    buttonContainer.remove();

    pictureCaption.appendChild(linkWrapper);
  } else {
    const caption = block.querySelector('div > p');
    if (caption) {
      caption.classList.add('caption-text');
      pictureCaption.appendChild(caption.parentElement);
    }
  }

  block.innerHTML = '';
  block.appendChild(pictureCaption);
}
