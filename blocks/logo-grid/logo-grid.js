export default function decorate(block) {
  const [title, ...grid] = [...block.children];

  title.classList.add('logo-grid-title');

  const gridGroup = document.createElement('div');
  gridGroup.classList.add('logo-grid-group');

  let hasText = false;

  grid.forEach((logo) => {
    logo.classList.add('logo-item');
    const [img, text] = [...logo.children];
    img.classList.add('logo-item-img');

    const logoHeading = logo.querySelector('h3');
    const logoText = logo.querySelector('p');

    if (logoHeading || logoText) {
      text.classList.add('logo-item-text');
      hasText = true;
    } else {
      text.remove();
    }

    gridGroup.appendChild(logo);
  });

  title.parentNode.appendChild(gridGroup);

  const buttonGroup = title.querySelectorAll('.button-container');
  const buttonWrapper = document.createElement('div');
  buttonWrapper.classList.add('button-wrapper');

  buttonGroup.forEach((button) => {
    const link = button.querySelector('a');
    link.setAttribute('aria-label', link.getAttribute('title'));
    buttonWrapper.appendChild(button);
  });
  title.parentNode.appendChild(buttonWrapper, gridGroup);

  const buttonWrapperCopy = buttonWrapper.cloneNode(true);
  title.appendChild(buttonWrapperCopy);

  if (!hasText) {
    gridGroup.style.flexDirection = 'row';
    gridGroup.style.flexWrap = 'wrap';
  }
}
