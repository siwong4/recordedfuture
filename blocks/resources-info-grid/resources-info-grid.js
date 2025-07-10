import { algoliasearch } from 'https://cdn.jsdelivr.net/npm/algoliasearch@5.20.1/+esm';
import { fetchPlaceholders } from '../../scripts/aem.js';
import { determineFilterType, getAlgoliaConfig, isValidUrl } from '../../utils/helper.js';
const { baseurl: BASE_URL } = await fetchPlaceholders();

let algoliaClient = null;

export default async function decorate(block) {
  const { appid, apikey, primaryindex, resourceindexdate } = await getAlgoliaConfig();

  algoliaClient = algoliasearch(appid, apikey);

  Array.from(block.children).forEach(async (column, i) => {
    const titleBlock = document.createElement('div');
    titleBlock.classList.add('title-block');

    // title
    const title = column.querySelector(':scope > div:nth-child(1) > p');
    if (title) {
      title.classList.add('title');
      titleBlock.appendChild(title);
    }

    // cta
    const cta = column.querySelector(':scope > div:nth-child(2) p');
    if (cta) {
      titleBlock.appendChild(cta);
    }

    // cards
    const cardContent = column.querySelector(':scope > div:nth-child(3)');
    let data;

    const list = cardContent.querySelector(':scope > ul');
    if (list) {
      data = [...list.children].map((li) => {
        const link = li.querySelector('a');
        const description = li.querySelector('ul > li');

        return {
          title: link?.title ?? link?.textContent ?? '',
          description: description?.textContent ?? '',
          url: link?.href ?? '',
        };
      });
    } else {
      const searchText = cardContent.querySelector('p')?.textContent ?? '';

      if (isValidUrl(searchText)) {
        const { href } = column.querySelector(':scope > div:nth-child(3)  a');
        const resp = await fetch(href);
        const result = await resp.json();

        data = (result.data || []).map(({ title, link: url, image, date, description }) => ({
          title,
          url,
          image,
          date,
          description,
        }));
      } else {
        const searchFilter = determineFilterType(searchText);
        const { results } = await algoliaClient.search([
          {
            indexName: searchText === 'blog' ? primaryindex : resourceindexdate,
            hitsPerPage: 3,
            filters: searchFilter.filter,
          },
        ]);

        data = (results[0]?.hits ?? []).map(({ publishedDate, title, excerpt, slug, extUrl, image }) => ({
          date: publishedDate.replace(/-/g, '/'),
          title,
          url: slug ?? extUrl,
          image,
        }));
      }
    }

    const cardsBlock = document.createElement('div');
    cardsBlock.classList.add('cards');

    data.forEach((el) => {
      const card = document.createElement('div');
      card.classList.add('card');

      // thumbnail
      if (el.image || el.image === '') {
        const thumbnailWrapper = document.createElement('div');
        thumbnailWrapper.classList.add('thumbnail');

        if (el.image) {
          const thumbnail = document.createElement('img');
          thumbnail.src = el.image;
          thumbnail.alt = 'Resource logo';
          thumbnailWrapper.appendChild(thumbnail);
        } else
          thumbnailWrapper.innerHTML = `<svg width="56" height="57" viewBox="0 0 56 57" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M24.699 3.64899V16.3093C24.699 18.3975 26.1662 19.9638 28.0001 19.9638C29.8341 19.9638 31.3013 18.3975 31.3013 16.4398V16.3093V3.64899C31.3013 1.69122 29.8341 0.125 28.0001 0.125C26.1662 0.125 24.699 1.69122 24.699 3.64899ZM36.6806 10.697V46.1979C36.8028 48.0252 38.1477 49.4609 39.8594 49.5914C41.6934 49.5914 43.2829 48.1557 43.4051 46.1979V46.0674V10.697V10.3054C43.2829 8.34767 41.6934 6.78145 39.8594 6.91197C38.0255 7.04248 36.5583 8.73922 36.6806 10.697ZM0 28.4474C0 26.098 1.83397 24.1403 4.03474 24.1403C6.23551 24.1403 8.06948 26.098 8.06948 28.4474C8.06948 30.7967 6.23551 32.7545 4.03474 32.7545C1.83397 32.7545 0 30.7967 0 28.4474ZM28.1172 24.1403C25.9164 24.1403 24.0825 26.098 24.0825 28.4474C24.0825 30.7967 25.9164 32.7545 28.1172 32.7545C30.318 32.7545 32.152 30.7967 32.152 28.4474C32.152 26.098 30.318 24.1403 28.1172 24.1403ZM51.9653 24.1403C49.7645 24.1403 47.9305 26.098 47.9305 28.4474C47.9305 30.7967 49.7645 32.7545 51.9653 32.7545C54.166 32.7545 56 30.7967 56 28.4474C56 26.098 54.166 24.1403 51.9653 24.1403ZM24.699 52.5934V39.9331C24.699 37.9754 26.1662 36.4091 28.0001 36.4091C29.8341 36.4091 31.3013 37.9754 31.3013 39.9331V52.5934C31.3013 54.5512 29.8341 56.1174 28.0001 56.1174C26.1662 56.2479 24.699 54.6817 24.699 52.5934ZM12.7116 46.1978V10.6968C12.7116 8.73905 14.1787 7.17283 16.0127 7.17283C17.8467 7.17283 19.3139 8.73905 19.3139 10.6968V46.0673V46.1978C19.3139 48.1555 17.8467 49.7218 16.0127 49.7218C14.1787 49.7218 12.7116 48.1555 12.7116 46.1978Z" fill="white"/>
</svg>
`;

        card.append(thumbnailWrapper);
      }

      // content
      const content = document.createElement('div');
      content.classList.add('content');

      // date
      if (el.date) {
        const dateEl = document.createElement('p');
        dateEl.classList.add('date');
        const date = new Date(el.date);

        if (isNaN(date.getTime())) {
          dateEl.innerText = el.date;
        } else {
          const formatted = date
            .toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })
            .toUpperCase();

          dateEl.innerText = formatted;
        }
        content.appendChild(dateEl);
      }

      // title
      if (el.title) {
        const cardTitle = document.createElement(el.url ? 'a' : 'p');
        cardTitle.classList.add('title');
        if (el.url) {
          const url = new URL(el.url, window.location.origin);
          cardTitle.href = url.href;
          if (
            i === 2 ||
            (!url.href.includes(BASE_URL) &&
              !url.href.includes(window.location.origin) &&
              !url.href.includes('recordedfuture.com'))
          ) {
            cardTitle.classList.add('external');
          }
        }
        cardTitle.innerText = el.title;
        content.appendChild(cardTitle);
      }

      // description
      if (el.description) {
        const cardDescription = document.createElement('p');
        cardDescription.classList.add('description');
        cardDescription.innerText = el.description;
        content.appendChild(cardDescription);
      }

      // card cta
      if (el.ctaLabel && el.ctaLink) {
        const cardCta = document.createElement('a');

        cardCta.classList.add('cta');

        const isExternalLink = new URL(el.ctaLink).origin !== location.origin;
        if (isExternalLink) {
          cardCta.innerHTML = `${el.ctaLabel}<svg xmlns="http://www.w3.org/2000/svg" width="11" height="10" viewBox="0 0 11 10" fill="none">
<path d="M6.20508 9.66406L5.43945 8.91211L8.58398 5.75391H0.421875V4.66016H8.58398L5.43945 1.51562L6.20508 0.75L10.6484 5.20703L6.20508 9.66406Z" fill="#0500FF"/>
</svg>`;
        } else {
          cardCta.innerHTML = el.ctaLabel;
        }
        cardCta.href = el.ctaLink;
        content.appendChild(cardCta);
      }

      card.append(content);

      cardsBlock.append(card);
    });
    column.innerHTML = '';
    column.append(titleBlock, cardsBlock);
  });
}
