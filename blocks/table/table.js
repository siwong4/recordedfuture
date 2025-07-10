/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 */
function buildCell(rowIndex) {
  const cell = rowIndex ? document.createElement('td') : document.createElement('th');
  if (!rowIndex) cell.setAttribute('scope', 'col');
  return cell;
}

export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const header = !block.classList.contains('no-header');
  if (header) table.append(thead);
  table.append(tbody);

  [...block.children].forEach((child, i) => {
    const row = document.createElement('tr');
    if (header && i === 0) thead.append(row);
    else tbody.append(row);
    [...child.children].forEach((col) => {
      const cell = buildCell(header ? i : i + 1);
      const align = col.getAttribute('data-align');
      const valign = col.getAttribute('data-valign');
      if (align) cell.style.textAlign = align;
      if (valign) cell.style.verticalAlign = valign;
      cell.innerHTML = col.innerHTML;
      row.append(cell);
    });
  });

  // move children elements into div
  const allHeaders = table.querySelectorAll('th');
  [...allHeaders].forEach((h) => {
    const colHeader = document.createElement('div');
    colHeader.classList.add('column-header');
    colHeader.append(...h.childNodes);
    h.innerHTML = '';
    h.append(colHeader);

    const pictures = h.querySelectorAll('picture');
    [...pictures].forEach((picture) => {
      const parent = picture.parentElement;
      if (parent.tagName != 'P') {
        const pTag = document.createElement('p');
        pTag.append(picture.cloneNode(true));
        picture.remove();
        parent.append(pTag);
      }
    });
  });

  // move children elements in cells into div
  const allCells = table.querySelectorAll('tbody > tr > td');
  [...allCells].forEach((item) => {
    const dataDiv = document.createElement('div');
    dataDiv.classList.add('table-data');
    dataDiv.append(...item.childNodes);
    item.innerHTML = '';
    item.append(dataDiv);
  });

  block.innerHTML = '';

  // add shadow
  const content = document.createElement('div');
  content.classList.add('content');
  content.setAttribute('tabindex', '0');
  content.appendChild(table);

  const shadowBottom = document.createElement('div');
  shadowBottom.classList.add('shadow');
  shadowBottom.classList.add('shadow-bottom');

  block.append(shadowBottom, content);

  const updateShadows = () => {
    if (content.scrollWidth <= content.clientWidth) {
      shadowBottom.style.opacity = 0;
    } else {
      var contentScrollHeight = content.scrollWidth - block.offsetWidth;
      var currentScroll = content.scrollLeft / contentScrollHeight;
      shadowBottom.style.opacity = 1 - currentScroll;
    }
  };

  content.addEventListener('scroll', updateShadows);
  const resizeObserver = new ResizeObserver(updateShadows);
  resizeObserver.observe(content.parentElement);
}
