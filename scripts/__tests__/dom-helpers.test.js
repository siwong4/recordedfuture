// Importing required dependencies

import * as domHelpers from '../domHelpers.js';

describe('domEl', () => {
  it('should create an element with the given tag', () => {
    const element = domHelpers.domEl('div');
    expect(element.tagName.toLowerCase()).toBe('div');
  });

  it('should create an element with attributes', () => {
    const element = domHelpers.domEl('button', { id: 'my-button', class: 'btn primary', disabled: true });
    expect(element.id).toBe('my-button');
    expect(element.className).toBe('btn primary');
    expect(element.hasAttribute('disabled')).toBe(true);
  });

  it('should append text content', () => {
    const element = domHelpers.domEl('p', 'Hello, world!');
    expect(element.textContent).toBe('Hello, world!');
  });

  it('should append multiple child elements', () => {
    const child1 = document.createElement('span');
    const child2 = document.createElement('strong');
    const parent = domHelpers.domEl('div', child1, child2);

    expect(parent.children.length).toBe(2);
    expect(parent.children[0]).toBe(child1);
    expect(parent.children[1]).toBe(child2);
  });

  it('should add event listeners', () => {
    const mockFn = jest.fn();
    const button = domHelpers.domEl('button', { onClick: mockFn });

    button.click();
    expect(mockFn).toHaveBeenCalled();
  });

  it('should handle attributes with array values', () => {
    const element = domHelpers.domEl('div', { class: ['container', 'fluid'] });
    expect(element.className).toBe('container fluid');
  });

  it('should handle elements without attributes or children', () => {
    const element = domHelpers.domEl('section');
    expect(element.tagName.toLowerCase()).toBe('section');
    expect(element.children.length).toBe(0);
  });
});

describe('shorthand element functions', () => {
  const elements = [
    'div',
    'p',
    'a',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'i',
    'img',
    'span',
    'form',
    'input',
    'label',
    'button',
    'iframe',
    'nav',
    'fieldset',
    'article',
    'strong',
    'select',
    'option',
  ];

  elements.forEach((tag) => {
    it(`should create a <${tag}> element`, () => {
      const element = domHelpers[tag]();
      expect(element.tagName.toLowerCase()).toBe(tag);
    });
  });
});
