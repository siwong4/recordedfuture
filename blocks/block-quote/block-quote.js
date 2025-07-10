/**
 * loads and decorates the block-quote
 * @param {Element} block The block-quote block element
 */
export default async function decorate(block) {
  const figureWrapper = document.createElement('div');
  const quoteContainer = document.createElement('div');
  quoteContainer.classList.add('quote-container');

  const showIcon = !block.classList.contains('no-icon');
  if (showIcon) {
    const marker = document.createElement('div');
    marker.classList.add('quotation-marker');
    quoteContainer.appendChild(marker);
  }

  figureWrapper.appendChild(quoteContainer);

  const quoteDiv = block.querySelector(':scope  > div:nth-child(1) > div');
  if (quoteDiv) {
    quoteDiv.classList.add('quote-wrapper');
    quoteContainer.appendChild(quoteDiv);

    const quote = quoteDiv.querySelector('p');
    if (quote) {
      quote.classList.add('quote');
    }
  }

  const authorWrapper = block.querySelector(':scope  > div:nth-child(2) > div');
  if (authorWrapper) {
    const pElements = block.querySelectorAll('p');
    [...pElements].forEach((element, i) => {
      if (i === 0) {
        element.classList.add('author');
      } else if (i === 1) {
        element.classList.add('job-title');
      }
    });
    authorWrapper.classList.add('author-wrapper');
    quoteContainer.appendChild(authorWrapper);
  }

  block.innerHTML = '';
  block.appendChild(figureWrapper);
}
