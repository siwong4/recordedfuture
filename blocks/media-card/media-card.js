import { getMetadata, createOptimizedPicture } from '../../scripts/aem.js';
import { createProductDemoImage } from '../demo-grid/utility.js';
import { buildButtonGroup } from '../../utils/helper.js';

const getDefaultEmbed = (
  url
) => `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
    <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen=""
      scrolling="no" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
    </iframe>
  </div>`;

function addVideo(videoURL, toContainer) {
  const videoContainer = document.createElement('div');
  videoContainer.classList.add('media-container');
  videoContainer.classList.add('video');
  videoContainer.innerHTML = getDefaultEmbed(videoURL);
  toContainer.appendChild(videoContainer);
}

function getContentFromJson(contentDetail, toContainer, bulletContainer) {
  const mediaTypeMeta = contentDetail.mediaType;

  if (mediaTypeMeta === 'video') {
    const videoURL = new URL(contentDetail.imageURL);
    addVideo(videoURL, toContainer);
  } else if (mediaTypeMeta === 'image') {
    const imageBlock = createProductDemoImage('primary', contentDetail.title, contentDetail.imageURL);
    imageBlock.classList.add('media-container');
    toContainer.appendChild(imageBlock);
  }

  // get bullet from json
  if (contentDetail.bullets) {
    const bullets = document.createElement('ul');
    bullets.classList.add('bullets');
    contentDetail.bullets.split('\n').forEach((bullet) => {
      const bulletLi = document.createElement('li');
      bulletLi.innerText = bullet;
      bullets.append(bulletLi);
    });
    bulletContainer.append(bullets);
  }
}

export default async function decorate(block) {
  const [headerContainer, dataContainer, buttonContainer] = block.children;
  const mediaDiv = document.createElement('div');

  // content container
  const contentContainer = document.createElement('div');
  contentContainer.classList.add('content-container');

  // header container
  if (headerContainer.children.length > 0) {
    headerContainer.classList.add('header-container');
    const title = headerContainer.querySelector('p');
    if (title) {
      title.classList.add('title');
      title.parentElement.classList.add('header-wrapper');
    }
    mediaDiv.appendChild(headerContainer);
  }

  const bulletContainer = document.createElement('div');

  if (block.classList.contains('image-file')) {
    // get image file from doc
    const imageDiv = document.createElement('div');
    imageDiv.classList.add('media-container');

    const picture = dataContainer.querySelector('picture');
    if (picture) {
      imageDiv.appendChild(picture);
      mediaDiv.appendChild(imageDiv);
    }
  } else if (block.classList.contains('video-link')) {
    // get video link from doc
    const videoUrl = dataContainer.querySelector('a');
    if (videoUrl) {
      addVideo(videoUrl, mediaDiv);
    }
  } else {
    // read content from json file
    const { href } = dataContainer.querySelector('a');
    if (href) {
      const title = getMetadata('media-card-title');
      const resp = await fetch(href);
      const { data } = await resp.json();

      const normalizeTitle = (str) => str.toLowerCase().replace(/[-\s]/g, '');
      const normalizedSearchTitle = normalizeTitle(title);

      const contentDetail = data.find((demo) => {
        const normalizedDemoTitle = normalizeTitle(demo.title);
        return normalizedDemoTitle === normalizedSearchTitle;
      });
      if (contentDetail) {
        getContentFromJson(contentDetail, mediaDiv, bulletContainer);
      }
    }
  }

  // content container
  const h2 = buttonContainer.querySelector('h2');
  if (h2) {
    contentContainer.appendChild(h2);
  }

  const pElements = buttonContainer.querySelectorAll('p');
  const iframeBtnLabel = block.closest('[data-iframe-button]')?.getAttribute('data-iframe-button');

  [...pElements].forEach((element) => {
    // iframe button
    if (element.innerText === iframeBtnLabel) {
      const anchor = element.querySelector('a');
      const demoURL = anchor.href;

      // create overlay
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

      // create iframe
      const iframeWrapper = document.createElement('div');
      iframeWrapper.classList.add('iframe-wrapper');
      const iframe = document.createElement('iframe');
      iframe.src = `${demoURL}?hideCookieBanner=true`;
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.setAttribute('webkitallowfullscreen', 'true');
      iframe.setAttribute('mozallowfullscreen', 'true');
      iframeWrapper.append(iframe);

      // event delegation to catch events on dynamically added anchor
      document.addEventListener('click', (event) => {
        const anchor = event.target.closest(`a[title="${iframeBtnLabel}"]`);
        if (anchor) {
          event.preventDefault();
          document.body.append(overlay, iframeWrapper);
          document.body.style.overflow = 'hidden';
        }
      });
    }
    if (element.classList.contains('button-container')) return;
    contentContainer.appendChild(element);
  });

  // add bullets from doc
  const ulElements = buttonContainer.querySelectorAll('ul');
  [...ulElements].forEach((element) => {
    element.classList.add('bullets');
    contentContainer.appendChild(element);
  });

  // get bullets from json
  if (bulletContainer.children.length > 0) {
    contentContainer.appendChild(bulletContainer.children[0]);
  }

  const buttonGroup = buildButtonGroup(buttonContainer, 'button-group', false);
  if (buttonGroup) {
    contentContainer.appendChild(buttonGroup);
  }
  mediaDiv.appendChild(contentContainer);

  block.innerHTML = '';
  block.appendChild(mediaDiv);

  block
    .querySelectorAll('picture > img')
    .forEach((img) =>
      img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]))
    );
}
