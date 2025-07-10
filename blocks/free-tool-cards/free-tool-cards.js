/**
 * loads and decorates the free-tool-cards block
 * @param {Element} block The free-tool-cards block element
 */
export default function decorate(block) {
  const titles = block.querySelectorAll('div > h3');
  [...titles].forEach((title) => {
    const cardDiv = title.parentElement;
    cardDiv.classList.add('tools-card');
    const ahref = cardDiv.querySelector('h3 > a');
    const icon = ahref.querySelector('.icon');
    if (icon) {
      const titleWrapper = document.createElement('div');
      titleWrapper.classList.add('title-wrapper');
      const label = document.createTextNode(ahref.textContent);
      titleWrapper.appendChild(label);
      titleWrapper.appendChild(icon.cloneNode(true));
      icon.remove();
      ahref.innerHTML = '';
      ahref.appendChild(titleWrapper);
    }
  });
}
