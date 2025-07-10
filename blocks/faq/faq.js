import { fetchSvg } from '../../utils/helper.js';

async function createFaqButton(title, content) {
  const faqButton = document.createElement('button');
  const faqIconContainer = document.createElement('span');

  const expandIcon = await fetchSvg('add_2');
  const collapseIcon = await fetchSvg('remove');

  faqButton.classList.add('faq-button');

  faqIconContainer.innerHTML = expandIcon;
  faqIconContainer.setAttribute('aria-hidden', true);

  faqButton.setAttribute('aria-expanded', 'false');

  content.style.height = 0;
  content.style.visibility = 'hidden';

  faqButton.addEventListener('click', () => {
    const isExpanded = faqButton.getAttribute('aria-expanded') === 'true';
    faqButton.setAttribute('aria-expanded', !isExpanded);

    if (!isExpanded) {
      content.classList.add('expanded');
      content.style.height = content.scrollHeight + 'px';
      content.style.visibility = 'visible';
      faqIconContainer.innerHTML = collapseIcon;
    } else {
      content.classList.remove('expanded');
      content.style.height = 0;
      content.style.visibility = 'hidden';
      faqIconContainer.innerHTML = expandIcon;
    }
  });

  faqButton.append(title, faqIconContainer);

  return faqButton;
}

export default async function decorate(block) {
  const [summary, ...faqs] = [...block.children];

  summary.classList.add('summary');

  const picture = summary.querySelector('picture');

  const faqGroup = document.createElement('div');
  faqGroup.classList.add('faq-group');

  block.appendChild(faqGroup);

  if (picture) {
    picture.parentNode.classList.add('faq-img');

    if (window.innerWidth <= 900) {
      block.parentNode.appendChild(picture.parentNode);
    } else {
      summary.appendChild(picture.parentNode);
    }
  }

  window.addEventListener('resize', () => {
    if (picture) {
      if (window.innerWidth <= 900 && picture.parentNode !== block.parentNode) {
        block.parentNode.appendChild(picture.parentNode);
      } else if (window.innerWidth > 900 && picture.parentNode !== summary) {
        summary.appendChild(picture.parentNode);
      }
    }
  });

  const faqFragment = document.createDocumentFragment();

  await Promise.all(
    faqs.map(async (faq) => {
      const heading = faq.querySelector('h2');
      const title = faq.querySelector('h3');
      const titleContainer = document.createElement('div');
      titleContainer.classList.add('faq-title');
      heading && titleContainer.append(heading);
      title && titleContainer.append(title);

      // content
      const contentWrapper = document.createElement('div');
      contentWrapper.classList.add('faq-content');
      const content = faq.querySelectorAll('p, div > ul');
      content.forEach((item) => {
        if (item.tagName === 'P') {
          contentWrapper.appendChild(item);
        } else {
          // bullets with title
          const childBullets = item.querySelectorAll('ul');
          if (childBullets.length > 0) {
            const bulletWrapper = document.createElement('div');
            const bulletTitleElement = document.createElement('p');

            // bullets with title
            const listElement = childBullets[0].parentElement;
            bulletTitleElement.textContent = listElement.childNodes[0].data;

            bulletWrapper.append(bulletTitleElement, childBullets[0]);
            contentWrapper.appendChild(bulletWrapper);
          } else {
            // no bullet title
            contentWrapper.appendChild(item);
          }
        }
      });

      const faqButton = await createFaqButton(titleContainer, contentWrapper);

      const faqItem = document.createElement('div');
      faqItem.classList.add('faq-item');

      faqItem.append(faqButton, contentWrapper);

      faqFragment.appendChild(faqItem);
      faq.remove();
    })
  );

  faqGroup.appendChild(faqFragment);
}
