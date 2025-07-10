export default function decorate(block) {
  const nextSteps = [...block.children];

  nextSteps.forEach((div) => {
    const [description, list] = [...div.children];

    description.classList.add('next-steps-description');

    while (div.firstChild) {
      div.parentNode.insertBefore(div.firstChild, div);
    }

    div.remove();

    const newUlList = document.createElement('ul');
    newUlList.classList.add('next-steps-list');

    const ul = list.querySelector('ul');

    if (ul) {
      const listElements = ul.querySelectorAll('li');
      listElements.forEach((li) => {
        const arrowIcon = document.createElement('img');
        arrowIcon.classList.add('arrow-icon');
        arrowIcon.src = '/graphics/arrow.svg';
        arrowIcon.alt = '';

        const link = li.querySelector('a');
        const innerUl = li.querySelector('ul');

        const listContainer = document.createElement('a');
        listContainer.classList.add('list-option');
        const cardContainer = document.createElement('div');
        cardContainer.classList.add('card-container');

        if (link) {
          const linkTitle = document.createElement('h4');
          const title = link.getAttribute('title');
          listContainer.href = link.href;
          linkTitle.textContent = title;
          linkTitle.setAttribute('aria-label', `${title} link`);
          cardContainer.appendChild(linkTitle);

          link.remove();
        }

        if (innerUl) {
          const textLi = innerUl.querySelector('li');

          if (textLi) {
            const newTextEl = document.createElement('p');
            newTextEl.classList.add('list-option--text');
            newTextEl.textContent = textLi.textContent;
            cardContainer.appendChild(newTextEl);

            innerUl.parentNode.replaceChild(cardContainer, innerUl);
          }
        }

        listContainer.append(arrowIcon, cardContainer);
        li.appendChild(listContainer);
      });

      while (ul.firstChild) {
        newUlList.appendChild(ul.firstChild);
      }
    }

    list.parentNode.replaceChild(newUlList, list);
  });
}
