export default function decorate(block) {
  const [description, links] = [...block.children];
  description.firstElementChild.classList.add('content-container');
  links.firstElementChild.classList.add('links-container');
}
