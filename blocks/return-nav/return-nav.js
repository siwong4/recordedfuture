export default function decorate(block) {
  const a = block.querySelector('.return-nav a');

  if (a) {
    const text = '<-- ' + a.textContent;

    a.setAttribute('aria-label', `Go back to ${a.textContent}`);
    a.textContent = text;
  }
}
