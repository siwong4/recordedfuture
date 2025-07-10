import { createProductDemoImage } from './utility.js';

export default async function decorate(block) {
  const type = block.closest('[data-type]')?.getAttribute('data-type');

  // demo cards
  const demoCardsWrapper = document.createElement('div');
  demoCardsWrapper.classList.add('demo-cards');
  const { href } = block.querySelector('a');
  const resp = await fetch(href);
  const { data } = await resp.json();

  const demosDataToDisplay = data.filter((demo) => demo.grid === type);
  demosDataToDisplay.forEach((demo) => {
    const demoCard = document.createElement('div');
    demoCard.classList.add('demo-card');

    // img block
    const imageUrl = demo.imageURL ? demo.imageURL : '/images/demo.png';
    const demoImgBlock = createProductDemoImage(type, demo.title, imageUrl);

    // text block
    const demoTextBlock = document.createElement('div');
    demoTextBlock.classList.add('text-block');

    if (demo.title) {
      const title = document.createElement('h2');
      title.classList.add('title');
      title.innerText = demo.title;
      demoTextBlock.append(title);
    }

    if (demo.description) {
      const description = document.createElement('p');
      description.classList.add('description');
      description.innerText = demo.description;
      demoTextBlock.append(description);
    }

    if (demo.bullets) {
      const bullets = document.createElement('ul');
      bullets.classList.add('bullets');
      demo.bullets.split('\n').forEach((bullet) => {
        const bulletLi = document.createElement('li');
        bulletLi.innerText = bullet;
        bullets.append(bulletLi);
      });
      demoTextBlock.append(bullets);
    }

    if (demo.demoURL) {
      const button = document.createElement('button');
      button.classList.add('button', 'primary');
      button.type = 'button';
      button.innerText = 'View Demos';

      const overlay = document.createElement('div');
      overlay.classList.add('overlay');
      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.classList.add('close-button');
      closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <mask id="mask0_13460_15679" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
    <rect x="0.5" y="0.5" width="23" height="23" fill="#D9D9D9" stroke="#F0F6FF"/>
  </mask>
  <g mask="url(#mask0_13460_15679)">
    <path d="M6.3999 18.1004L5.8999 17.6004L11.4999 12.0004L5.8999 6.40039L6.3999 5.90039L11.9999 11.5004L17.5999 5.90039L18.0999 6.40039L12.4999 12.0004L18.0999 17.6004L17.5999 18.1004L11.9999 12.5004L6.3999 18.1004Z" fill="white" stroke="white"/>
  </g>
</svg>`;
      closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        document.body.removeChild(iframeWrapper);
        document.body.style.overflow = 'auto';
      });
      overlay.append(closeButton);

      const iframeWrapper = document.createElement('div');
      iframeWrapper.classList.add('iframe-wrapper');
      const iframe = document.createElement('iframe');
      iframe.src = `${demo.demoURL}?hideCookieBanner=true`;
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.setAttribute('webkitallowfullscreen', 'true');
      iframe.setAttribute('mozallowfullscreen', 'true');
      iframeWrapper.append(iframe);

      button.addEventListener('click', () => {
        document.body.append(overlay, iframeWrapper);
        document.body.style.overflow = 'hidden';
      });

      demoTextBlock.append(button);
    }

    demoCard.append(demoImgBlock, demoTextBlock);

    demoCardsWrapper.append(demoCard);
  });

  block.innerHTML = '';
  block.append(demoCardsWrapper);
}
