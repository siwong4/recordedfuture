import ffetch from '../../scripts/ffetch.js';

const setSliderSpeed = (sliders, speed) => {
  sliders.forEach((slider) => {
    requestAnimationFrame(() => {
      const totalWidth = slider.scrollWidth;
      const duration = Math.max(totalWidth / speed, 30);
      slider.style.animationDuration = `${duration}s`;
    });
  });
};

const sliderInteraction = (parent) => {
  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;

  // touch event variables for mobile
  let isTouching = false;
  let touchStartX = 0;

  const pauseAnimation = () => {
    const sliders = parent.querySelectorAll('.slider');
    sliders.forEach((slider) => {
      slider.style.animationPlayState = 'paused';
    });
  };

  const resumeAnimation = () => {
    const sliders = parent.querySelectorAll('.slider');
    sliders.forEach((slider) => {
      slider.style.animationPlayState = 'running';
    });
  };

  // touch events
  parent.addEventListener('touchstart', (e) => {
    pauseAnimation();
    isTouching = true;
    touchStartX = e.touches[0].pageX - parent.offsetLeft;
    scrollLeft = parent.scrollLeft;

    e.preventDefault();
  });

  // mouse events
  parent.addEventListener('mousedown', (e) => {
    pauseAnimation();
    isDragging = true;
    startX = e.pageX - parent.offsetLeft;
    scrollLeft = parent.scrollLeft;
    parent.style.cursor = 'grabbing';
  });

  parent.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - parent.offsetLeft;
    const walk = (x - startX) * 1;
    parent.scrollLeft = scrollLeft - walk;
  });

  parent.addEventListener('mouseup', () => {
    resumeAnimation();
    isDragging = false;
    parent.style.cursor = 'grab';
  });

  parent.addEventListener('mouseleave', () => {
    if (!isDragging) return;
    resumeAnimation();
    isDragging = false;
    parent.style.cursor = 'grab';
  });

  parent.addEventListener('touchmove', (e) => {
    if (!isTouching) return;
    const x = e.touches[0].pageX - parent.offsetLeft;
    const walk = (x - touchStartX) * 1;
    parent.scrollLeft = scrollLeft - walk;

    e.preventDefault();
  });

  parent.addEventListener('touchend', () => {
    resumeAnimation();
    isTouching = false;
  });
};

export default async function decorate(block) {
  const urlEl = block.querySelector('.logo-garden div > p > a');
  if (!urlEl) return;

  const url = urlEl.href;

  const data = await ffetch(url)
    .map((item) => ({
      image: item.image,
      name: item.name,
    }))
    .all();

  if (!data?.length) return;

  const sliderContainer = document.createElement('div');
  sliderContainer.classList.add('slider');

  data.forEach((item) => {
    const container = document.createElement('div');
    container.classList.add('logo');
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;
    img.loading = 'lazy';
    container.appendChild(img);
    sliderContainer.appendChild(container);
  });

  const logoGarden = document.querySelector('.logo-garden');
  const duplicateSlider = sliderContainer.cloneNode(true);
  logoGarden.appendChild(duplicateSlider);

  block.appendChild(sliderContainer);

  const div = block.querySelector('.logo-garden div');
  div?.remove();

  const speed = 100;
  const sliders = document.querySelectorAll('.slider');
  setSliderSpeed(sliders, speed);
  sliderInteraction(logoGarden);
}
