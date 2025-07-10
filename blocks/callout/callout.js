export default function decorate(block) {
  const calloutText = block.querySelector('h2');
  const whiteContainer = document.createElement('div');
  const redContainer = document.createElement('div');

  whiteContainer.className = 'white-container';
  redContainer.className = 'red-container';

  whiteContainer.appendChild(calloutText);

  block.textContent = '';
  block.append(whiteContainer, redContainer);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const whiteDiv = entry.target.querySelector('.white-container');
      const redDiv = entry.target.querySelector('.red-container');

      if (entry.isIntersecting) {
        whiteDiv && whiteDiv.classList.add('in-view');
        redDiv && redDiv.classList.add('in-view');
        return;
      }

      // We're not intersecting, so remove the class
      if (whiteDiv && whiteDiv.classList.contains('in-view')) whiteDiv.classList.remove('in-view');
      if (redDiv && redDiv.classList.contains('in-view')) redDiv.classList.remove('in-view');
    });
  });
  observer.observe(block);
}
