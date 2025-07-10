const searchInput = document.getElementById('search-input');
const clearButton = document.getElementById('clear-button');

function renderItems(tag) {
  let html = `<div class="tag" data-value="${tag.tagId}">${tag.name}</div>`;
  return html;
}

const getReduceTags = (oTaxonomy, sCategory) => {
  const sCategoryCapital = sCategory.charAt(0).toUpperCase() + sCategory.slice(1);

  return oTaxonomy.reduce((oAccumulated, oObject) => {
    // eslint-disable-next-line no-unused-expressions
    oAccumulated[sCategory] || (oAccumulated[sCategory] = []);
    if (oObject[`${sCategoryCapital} Value`] && oObject[`${sCategoryCapital} Text`]) {
      oAccumulated[sCategory].push({
        value: oObject[`${sCategoryCapital} Value`],
        text: oObject[`${sCategoryCapital} Text`],
      });
    }
    return oAccumulated;
  }, {});
};

function initTaxonomy(taxonomy) {
  let html = '';
  html += '<div class="tags-container">';
  for (const tag of taxonomy) {
    html += renderItems(tag);
  }
  html += '</div>';
  const results = document.getElementById('results');
  results.innerHTML = html;
}

async function getTaxonomy() {
  const resp = await fetch('/tools/sidekick/tagger.json');
  const tagsJson = await resp.json();
  return tagsJson.data;
}

function doFilter() {
  const searchInputValue = searchInput.value;

  if (searchInputValue.trim() !== '') {
    clearButton.style.display = 'block';
  } else {
    clearButton.style.display = 'none';
  }

  const searchTermArr = searchInputValue.toLowerCase().split(' ');
  const allTags = document.querySelectorAll('#results .tag');
  const tagsArr = Array.from(allTags);
  // Filter the input array
  tagsArr.filter((tagEl) => {
    // Convert the item to lowercase for case-insensitive comparison
    const tagName = tagEl.innerText.toLowerCase();

    // Check if the item contains all the search words
    const found = searchTermArr.every((word) => tagName.includes(word));
    if (found) {
      tagEl.classList.remove('filtered');
    } else {
      tagEl.classList.add('filtered');
    }
    return found;
  });
}

function toggleTag(target) {
  target.classList.toggle('selected');
  // eslint-disable-next-line no-use-before-define
  displaySelected();
  const selEl = document.getElementById('selected');
  const copyButton = selEl.querySelector('button.copy');
  copyButton.disabled = false;
}

function removeSelected(element) {
  const tagId = element.dataset.value;
  element.remove();
  const item = document.querySelector(`#results .tag.selected[data-value="${tagId}"]`);
  item.classList.remove('selected');
}

function displaySelected() {
  const selEl = document.getElementById('selected');
  const selTagsEl = selEl.querySelector('.selected-tags');
  const toCopyBuffer = [];

  selTagsEl.innerHTML = '';
  const selectedTags = document.querySelectorAll('#results .tag.selected');
  if (selectedTags.length > 0) {
    selectedTags.forEach((tag) => {
      const clonedTag = tag.cloneNode(true);
      clonedTag.classList.remove('filtered', 'selected');
      clonedTag.addEventListener('click', (e) => {
        removeSelected(e.target);
      });
      toCopyBuffer.push(tag.dataset.value);
      selTagsEl.append(clonedTag);
    });

    selEl.classList.remove('hidden');
  } else {
    selEl.classList.add('hidden');
  }

  const copybuffer = document.getElementById('copybuffer');
  copybuffer.value = toCopyBuffer.join(', ');
}

async function init() {
  const tax = await getTaxonomy();

  initTaxonomy(tax);

  const selEl = document.getElementById('selected');
  const copyButton = selEl.querySelector('button.copy');
  copyButton.addEventListener('click', () => {
    const copyText = document.getElementById('copybuffer');
    navigator.clipboard.writeText(copyText.value);
    copyButton.disabled = true;
  });

  selEl.querySelector('button.clear').addEventListener('click', () => {
    const selectedTags = document.querySelectorAll('#results .tag.selected');
    selectedTags.forEach((tag) => {
      toggleTag(tag);
    });
  });

  searchInput.addEventListener('keyup', doFilter);

  // Clear the input and hide the 'x' button when clicked
  clearButton.addEventListener('click', () => {
    searchInput.value = '';
    clearButton.style.display = 'none';
    doFilter();
  });

  document.querySelectorAll('.tag').forEach((tag) => {
    tag.addEventListener('click', () => {
      // tag.classList.toggle('selected');
      toggleTag(tag);
    });
  });
}

init();
