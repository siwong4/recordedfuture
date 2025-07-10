/**
 * loads and decorates the skip-to-main block
 * @param {Element} block The skip-to-main block element
 */

const anchorHandler = (e) => {
  e.preventDefault();
  document.getElementsByTagName('main')[0].focus();
};

export function decorateSkipToMain() {
  const main = document.getElementsByTagName('main')[0];
  if (!main) return;

  main.setAttribute('id', 'main');
  main.setAttribute('tabindex', '-1');

  const block = document.createElement('div');
  block.classList.add('skip-main');
  const anchor = document.createElement('a');
  anchor.href = '#main';
  anchor.innerText = 'Skip to main content';
  block.appendChild(anchor);
  document.body.prepend(block);

  anchor.addEventListener('click', anchorHandler);
  anchor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      anchorHandler(e);
    } else anchor.focusout();
  });

  document.addEventListener(
    'scroll',
    () => {
      anchor.blur();
    },
    { once: true }
  );

  const style = document.createElement('style');
  style.textContent = `
  .skip-main {
    opacity: 0;
    position:absolute;
  }

  .skip-main:has(a:focus), .skip-main:has(a:active)  {
    position:relative;
    opacity: 1;
    background-color: var(--background-color-blue-400);
    padding: var(--space-6) 0;
    text-align:center;
    z-index:999;
  }

  .skip-main a:focus, .skip-main a:active {
    display: inline-block;
    border-radius: 102px;
    border: 1px solid #fff;
    padding: var(--space-4) var(--space-5);
    color: #fff;
    font-size: 18px;
  }
`;
  document.head.appendChild(style);
}
