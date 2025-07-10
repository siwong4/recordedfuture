import { fetchSvg } from '../../utils/helper.js';

export default function decorate(block) {
  const leftRight = [...block.children];

  const image = leftRight.find((child) => child.querySelector('picture'));
  const content = leftRight.find((child) => child !== image);

  image.classList.add('left-right-image');
  content.classList.add('left-right-content');

  const [icon, picture] = image.children;

  icon.classList.add('image-icon');
  picture.classList.add('image-picture');

  const imageElement = picture.querySelector('img');
  if (imageElement) {
    imageElement.alt = '';
  }

  icon.setAttribute('aria-hidden', 'true');
  picture.setAttribute('aria-hidden', 'true');

  const buttonContainer = content.querySelectorAll('.button-container');
  const listContainer = content.querySelector('ul');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          block.classList.add('animate');
        } else {
          block.classList.remove('animate');
        }
      });
    },
    { threshold: 0.5 }
  );

  observer.observe(block);

  if (buttonContainer) {
    const primaryButton = buttonContainer[buttonContainer.length - 1];

    if (primaryButton) {
      const link = primaryButton.querySelector('a');
      link.setAttribute('aria-label', `${link.textContent.trim()} button`);
    }

    const buttonWrapper = document.createElement('div');
    buttonWrapper.classList.add('button-wrapper');

    buttonContainer.forEach((container) => {
      buttonWrapper.appendChild(container);
    });

    content.appendChild(buttonWrapper);
  }

  if (listContainer) {
    listContainer.classList.add('list-container');

    Array.from(listContainer.children).forEach(async (li) => {
      const heading = li.firstChild;
      const listItems = li.querySelector('ul');

      const headingContainer = document.createElement('div');
      headingContainer.classList.add('list-heading');
      headingContainer.append(heading);

      if (heading && heading.nodeType === Node.TEXT_NODE) {
        const h5 = document.createElement('h5');
        h5.textContent = heading.textContent.trim();
        heading.replaceWith(h5);
      }

      const [itemContainer, iconContainer] = listItems.querySelectorAll('li');
      if (itemContainer) {
        const textDescription = document.createElement('p');
        textDescription.textContent = itemContainer.textContent.trim();

        listItems.parentNode.replaceChild(textDescription, itemContainer.parentNode);
      }

      if (iconContainer) {
        const icon = iconContainer.querySelector('img');
        icon.classList.add('list-icon');
        headingContainer.prepend(icon);
      } else {
        const icon = document.createElement('div');
        icon.classList.add('list-icon');
        const defaultIcon = await fetchSvg('list_icon');
        icon.innerHTML = defaultIcon;
        headingContainer.prepend(icon);
      }

      li.prepend(headingContainer);
    });
  }

  if (image === leftRight[0]) {
    icon.style.left = 0;
    icon.style.transform = 'translate(-50%, -25%)';
  } else {
    icon.style.right = 0;
    icon.style.transform = 'translate(50%, -25%)';
  }
}
