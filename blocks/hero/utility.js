export function ulToButtonGroup(ulElement, buttonGroupName, isDarkMode = false) {
  const buttonGroup = ulElement.cloneNode(true);
  buttonGroup.classList.add(buttonGroupName);

  const buttons = buttonGroup.querySelectorAll('li');
  [...buttons].forEach((button, i) => {
    const buttonLink = button.getElementsByTagName('a');
    [...buttonLink].forEach((element) => {
      element.classList.add('button');
      if (buttons.length > 1) {
        if (i === 0) {
          element.classList.add('secondary');
        } else {
          element.classList.add('primary');
        }
      } else {
        element.classList.add('secondary');
      }
      if (isDarkMode) {
        element.classList.add('dark');
      }
    });
  });

  return buttonGroup;
}
