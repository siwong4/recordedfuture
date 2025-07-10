const BACKGROUND_COLOR_BLUE_200 = '#0500ff';
const BACKGROUND_COLOR_WHITE = '#FFFFFF';
const BACKGROUND_COLOR_RED_200 = '#EB001B';
const BACKGROUND_COLOR_BLUE_50 = '#EDF4FF';

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="33" height="31" viewBox="0 0 33 31" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M16.4257 13.1982C15.1724 13.1982 14.1279 14.2419 14.1279 15.4944C14.1279 16.7468 15.1724 17.7905 16.4257 17.7905C17.6791 17.7905 18.7235 16.7468 18.7235 15.4944C18.7235 14.2419 17.6791 13.1982 16.4257 13.1982Z" fill="#0500FF"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M30.0029 13.1982C28.7495 13.1982 27.7051 14.2419 27.7051 15.4944C27.7051 16.7468 28.7495 17.7905 30.0029 17.7905C31.2562 17.7905 32.3007 16.7468 32.3007 15.4944C32.3007 14.2419 31.2562 13.1982 30.0029 13.1982Z" fill="#0500FF"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M2.70796 13.1982C1.45461 13.1982 0.410156 14.2419 0.410156 15.4944C0.410156 16.7468 1.45461 17.7905 2.70796 17.7905C3.96131 17.7905 5.00576 16.7468 5.00576 15.4944C5.00576 14.2419 3.96131 13.1982 2.70796 13.1982Z" fill="#0500FF"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M14.4756 28.3671V21.6179C14.4756 20.5742 15.3111 19.7393 16.3556 19.7393C17.4001 19.7393 18.2356 20.5742 18.2356 21.6179V28.3671C18.2356 29.4108 17.4001 30.2458 16.3556 30.2458C15.3111 30.3154 14.4756 29.4804 14.4756 28.3671Z" fill="#0500FF"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M21.299 24.9563V6.03065C21.2293 4.98696 22.0649 4.08242 23.1094 4.01284C24.1538 3.94326 25.059 4.77822 25.1287 5.82191V6.03065V24.8867V24.9563C25.059 26 24.1538 26.7654 23.1094 26.7654C22.1345 26.6958 21.3686 25.9304 21.299 24.9563Z" fill="#0500FF"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M7.65137 24.9566V6.03099C7.65137 4.9873 8.48693 4.15234 9.53139 4.15234C10.5758 4.15234 11.4114 4.9873 11.4114 6.03099V24.8871V24.9566C11.4114 26.0003 10.5758 26.8353 9.53139 26.8353C8.48693 26.8353 7.65137 26.0003 7.65137 24.9566Z" fill="#0500FF"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M14.4756 9.02338V2.27416C14.4756 1.23046 15.3111 0.395508 16.3556 0.395508C17.4001 0.395508 18.2356 1.23046 18.2356 2.27416V9.02338V9.09296C18.2356 10.1367 17.4001 10.9716 16.3556 10.9716C15.3111 10.9716 14.4756 10.1367 14.4756 9.02338Z" fill="#0500FF"/>
</svg>`;

const CIRCLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="78" height="78" viewBox="0 0 78 78" fill="none">
  <circle cx="39" cy="39" r="39" fill="none"/>
</svg><svg xmlns="http://www.w3.org/2000/svg" width="175" height="78" viewBox="0 0 175 78" fill="none">
  <path d="M39.0802 7.28883e-08C60.5395 1.94933e-06 300 2.28882e-05 300 2.28882e-05L300 78L37.9078 78C16.9716 78 1.48034e-06 61.0631 3.30648e-06 40.17C3.34057e-06 39.78 3.37466e-06 39.39 3.40875e-06 39C5.29138e-06 17.4604 17.4971 -1.81438e-06 39.0802 7.28883e-08Z" fill="#EB001B"/>
</svg>`;

const OVAL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="508" height="107" viewBox="0 0 508 107" fill="none">
  <path d="M69.297 4.9388e-05C107.349 5.27153e-05 551.5 0.000106812 551.5 0.000106812L551.5 138L67.218 138C30.0941 138 2.61907e-06 108.035 5.84993e-06 71.07C5.91024e-06 70.38 5.97055e-06 69.69 6.03086e-06 69C9.36167e-06 30.8916 31.0259 4.60415e-05 69.297 4.9388e-05Z" fill="none"/>
</svg>`;

export function createProductDemoImage(imageType, imageTitle, logoPath) {
  const demoImgBlock = document.createElement('div');
  demoImgBlock.classList.add('img-block');

  const logoTitle = document.createElement('div');
  logoTitle.classList.add('logo-title');

  const logo = document.createElement('div');
  logo.classList.add('logo');
  logo.innerHTML = LOGO_SVG;

  logo.querySelectorAll('svg path').forEach((path) => {
    path.setAttribute('fill', imageType === 'primary' ? BACKGROUND_COLOR_WHITE : BACKGROUND_COLOR_BLUE_200);
  });
  logoTitle.append(logo);

  const title = document.createElement('p');
  title.classList.add('img-title');
  title.innerText = `${imageTitle} Demos`;
  logoTitle.append(title);
  demoImgBlock.append(logoTitle);

  const decorImgs = document.createElement('div');
  decorImgs.classList.add('img-decor');

  const circlesTop = document.createElement('div');
  circlesTop.classList.add('circles-top');
  circlesTop.innerHTML = CIRCLE_SVG;
  circlesTop
    .querySelector('svg circle')
    .setAttribute('fill', imageType === 'primary' ? BACKGROUND_COLOR_RED_200 : BACKGROUND_COLOR_BLUE_200);
  decorImgs.append(circlesTop);

  const ovalBottom = document.createElement('div');
  ovalBottom.classList.add('oval-bottom');
  ovalBottom.innerHTML = OVAL_SVG;
  ovalBottom
    .querySelector('svg path')
    .setAttribute('fill', imageType === 'primary' ? BACKGROUND_COLOR_BLUE_50 : BACKGROUND_COLOR_BLUE_200);
  decorImgs.append(ovalBottom);

  const demoScreenshot = document.createElement('img');
  demoScreenshot.src = logoPath;
  demoScreenshot.alt = 'Demo screenshot';
  demoScreenshot.classList.add('demo-screenshot');
  decorImgs.append(demoScreenshot);

  demoImgBlock.append(decorImgs);

  return demoImgBlock;
}
