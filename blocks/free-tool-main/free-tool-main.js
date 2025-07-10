/**
 * loads and decorates the free-tool-main block
 * @param {Element} block The free-tool-main block element
 */
export default function decorate(block) {
  const mainDiv = block.querySelector('h2').parentElement;

  const pTag = mainDiv.querySelector('.button-container');
  const buttonDiv = document.createElement('div');
  buttonDiv.classList.add('button-container');
  buttonDiv.innerHTML = pTag.innerHTML;

  const buttonIcon = buttonDiv.querySelector('.icon > img');
  if (buttonIcon) {
    buttonIcon.setAttribute('alt', 'Go to link');
  }
  mainDiv.replaceChild(buttonDiv, pTag);

  // move picture into div
  const pictureDiv = mainDiv.querySelector('p > picture');
  if (pictureDiv) {
    const pictureWrapper = document.createElement('div');
    pictureWrapper.classList.add('picture-wrapper');
    pictureWrapper.appendChild(pictureDiv.cloneNode(true));
    mainDiv.appendChild(pictureWrapper);

    pictureDiv.parentElement.remove();
  }

  const headerDiv = document.createElement('div');
  headerDiv.classList.add('header-wrapper');
  const pictureWrapper = mainDiv.querySelector('.picture-wrapper');
  const childNodes = mainDiv.children;
  [...childNodes].forEach((element) => {
    if (pictureWrapper && pictureWrapper === element) return;
    headerDiv.appendChild(element.cloneNode(true));
    element.remove();
  });

  block.innerHTML = '';
  block.appendChild(headerDiv);

  if (pictureWrapper) {
    block.appendChild(pictureWrapper);
  }
}
