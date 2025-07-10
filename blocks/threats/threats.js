import { algoliasearch } from 'https://cdn.jsdelivr.net/npm/algoliasearch@5.20.1/+esm';
import { fetchSvg, formatDate } from '../../utils/helper.js';
import { getAlgoliaConfig } from '../../utils/helper.js';
import { fetchPlaceholders } from '../../scripts/aem.js';

const { baseurl: BASE_URL } = await fetchPlaceholders();
const MAX_ITEMS = 3;

async function createThreatItem(item) {
  const threatItem = document.createElement('a');
  threatItem.href = `${BASE_URL}/vulnerability-database/${encodeURIComponent(item.title)}`;

  const modifiedDate = item.modifiedDate ? formatDate(item.modifiedDate) : '';

  threatItem.className = 'threat-item';
  threatItem.innerHTML = `<div class='threat-item-header'>
                            <div class='threat-number ${item.severity}'>${item.baseScore}</div>
                            <div class='threat-item-header-details'>
                              <p class='threat-item-title'>${item.title}</p>
                              ${
                                item.modifiedDate
                                  ? `<div class='threat-item-updated-details'>
                                <p class='updated'>Updated</p>
                                <p class='threat-item-date-modified'>${modifiedDate}</p>
                              </div>`
                                  : ''
                              }
                            </div>
                      </div>
                      <p class='threat-item-description'>${item._snippetResult.summary.value}</p>`;
  return threatItem;
}

export default async function decorate(block) {
  const { appid, apikey, cveindex } = await getAlgoliaConfig();
  const client = algoliasearch(appid, apikey);

  const { results } = await client.search([
    {
      indexName: cveindex,
      hitsPerPage: 3,
    },
  ]);

  // there is always only 1 row
  const firstRow = block.children[0].firstElementChild;
  const [title, button] = firstRow.children;
  title.className = 'threats-title';
  const linkIcon = await fetchSvg('east');
  const hits = results[0].hits;
  const wrapper = document.createElement('div');
  wrapper.className = 'wrapper';
  const threatItemsWrapper = document.createElement('div');
  threatItemsWrapper.className = 'threats-items-wrapper';
  block.textContent = '';
  await Promise.all(
    hits.map(async (item) => {
      const cardItem = await createThreatItem(item);
      return cardItem;
    })
  ).then((items) => {
    items.slice(0, MAX_ITEMS).map((item) => threatItemsWrapper.append(item));
  });

  const buttonLink = button.querySelector('a');
  buttonLink.className = 'threat-view-all-button';
  buttonLink.innerHTML = `${buttonLink.textContent}${linkIcon}`;

  wrapper.append(threatItemsWrapper, buttonLink);
  block.append(title, wrapper);
}
