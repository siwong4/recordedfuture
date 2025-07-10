import {
  fetchSvg,
  swipeLeftRight,
  SWIPE_DIRECTION,
  hexToRGB,
  applyBackgroundStylesFromMetadata,
  decodeHTMLEntities,
  encodeHTMLEntities,
} from '../helper.js'; // Adjust the import path accordingly

describe('fetchSvg', () => {
  window.hlx = { codeBasePath: '/base/path' }; // Mock window.hlx
  const mockSvg = '<svg>mock</svg>';

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(mockSvg),
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Clean up mocks
  });

  it('should fetch SVG successfully with default path', async () => {
    const result = await fetchSvg('iconName');
    expect(fetch).toHaveBeenCalledWith(`/base/path/icons/iconName.svg`);
    expect(result).toBe(mockSvg);
  });

  it('should fetch SVG successfully with custom path', async () => {
    const result = await fetchSvg('iconName', 'custom/path');
    expect(global.fetch).toHaveBeenCalledWith(`/base/pathcustom/path/iconName.svg`);
    expect(result).toBe(mockSvg);
  });

  it('should return null if response is not ok', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
    });

    const result = await fetchSvg('iconName');
    expect(global.fetch).toHaveBeenCalledWith(`/base/path/icons/iconName.svg`);
    expect(result).toBeNull();
  });

  it('should return null and log error if fetch fails', async () => {
    const mockError = new Error('Network error');
    global.fetch.mockRejectedValueOnce(mockError);
    console.error = jest.fn(); // Mock console.error

    const result = await fetchSvg('iconName');
    expect(global.fetch).toHaveBeenCalledWith(`/base/path/icons/iconName.svg`);
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(mockError);
  });
});

describe('swipeLeftRight', () => {
  let container;
  let swipeListener;

  beforeEach(() => {
    // Create a mock container element
    container = document.createElement('div');
    document.body.appendChild(container);

    // Create a mock swipeListener function
    swipeListener = jest.fn();
  });

  afterEach(() => {
    // Clean up the container element
    document.body.removeChild(container);
  });

  it('should call swipeListener with SWIPE_DIRECTION.RIGHT when swiping right', () => {
    swipeLeftRight(container, swipeListener);

    // Simulate touchstart event
    const touchStartEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 50 }],
    });
    container.dispatchEvent(touchStartEvent);

    // Simulate touchmove event (swipe right)
    const touchMoveEvent = new TouchEvent('touchmove', {
      touches: [{ clientX: 50, clientY: 50 }], // xDiff = 100 - 50 = 50 (positive, swipe right)
    });
    container.dispatchEvent(touchMoveEvent);

    // Verify swipeListener was called with SWIPE_DIRECTION.RIGHT
    expect(swipeListener).toHaveBeenCalledWith(SWIPE_DIRECTION.RIGHT);
  });

  it('should call swipeListener with SWIPE_DIRECTION.LEFT when swiping left', () => {
    swipeLeftRight(container, swipeListener);

    const touchStartEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 50 }],
    });
    container.dispatchEvent(touchStartEvent);

    const touchMoveEvent = new TouchEvent('touchmove', {
      touches: [{ clientX: 150, clientY: 50 }], // xDiff = 100 - 150 = -50 (negative, swipe left)
    });
    container.dispatchEvent(touchMoveEvent);

    expect(swipeListener).toHaveBeenCalledWith(SWIPE_DIRECTION.LEFT);
  });

  it('should not call swipeListener when vertical swipe is detected', () => {
    swipeLeftRight(container, swipeListener);

    const touchStartEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 50 }],
    });
    container.dispatchEvent(touchStartEvent);

    // Simulate touchmove event (vertical swipe)
    const touchMoveEvent = new TouchEvent('touchmove', {
      touches: [{ clientX: 100, clientY: 100 }], // yDiff = 50 - 100 = -50 (vertical swipe, no horizontal swipe)
    });
    container.dispatchEvent(touchMoveEvent);

    // Verify swipeListener was not called
    expect(swipeListener).not.toHaveBeenCalled();
  });

  it('should not call swipeListener if touchstart was not triggered', () => {
    swipeLeftRight(container, swipeListener);

    // Simulate touchmove event without touchstart
    const touchMoveEvent = new TouchEvent('touchmove', {
      touches: [{ clientX: 150, clientY: 50 }],
    });
    container.dispatchEvent(touchMoveEvent);

    // Verify swipeListener was not called
    expect(swipeListener).not.toHaveBeenCalled();
  });
});

describe('hexToRGB', () => {
  it('should remove the hash if present and return RGB format', () => {
    expect(hexToRGB('#abc123')).toBe('171, 193, 35');
  });
});

describe('applyBackgroundStylesFromMetadata', () => {
  let main, section1, section2, getComputedStyleMock;

  beforeEach(() => {
    main = document.createElement('main');

    section1 = document.createElement('div');
    section1.classList.add('section', 'bg-color-blue-300', 'bg-opacity-60', 'bg-rd-radius-br');

    section2 = document.createElement('div');
    section2.classList.add('section', 'bg-color-red-500', 'bg-opacity-80', 'bg-rd-radius-tl', 'bg-rd-radius-tr');

    main.appendChild(section1);
    main.appendChild(section2);

    getComputedStyleMock = jest.fn().mockReturnValue({
      getPropertyValue: (varName) => {
        if (varName === '--background-color-blue-300') return '#001e89';
        if (varName === '--background-color-red-500') return '#ff0000';
        if (varName === '--corner-lg') return '102px';
        if (varName === '--corner-sm') return '24px';
        return '';
      },
    });

    global.getComputedStyle = getComputedStyleMock;
  });

  it('should set background color and opacity for all sections', () => {
    applyBackgroundStylesFromMetadata(main);

    expect(section1.style.backgroundColor).toBe('rgba(0, 30, 137, 0.6)');
    expect(section2.style.backgroundColor).toBe('rgba(255, 0, 0, 0.8)');
  });

  it('should set border-radius for all sections based on screen width', () => {
    // Test for small screen width
    global.innerWidth = 500;
    applyBackgroundStylesFromMetadata(main);

    expect(section1.style.borderRadius).toBe('0 0 24px 0');
    expect(section2.style.borderRadius).toBe('24px 24px 0 0');

    // Test for large screen width
    global.innerWidth = 1024;
    applyBackgroundStylesFromMetadata(main);

    expect(section1.style.borderRadius).toBe('0 0 102px 0');
    expect(section2.style.borderRadius).toBe('102px 102px 0 0');
  });

  it('should not apply any styles if no bg- classes are found', () => {
    section1.className = 'section';
    section2.className = 'section';
    applyBackgroundStylesFromMetadata(main);

    expect(section1.style.backgroundColor).toBe('');
    expect(section1.style.borderRadius).toBe('');
    expect(section2.style.backgroundColor).toBe('');
    expect(section2.style.borderRadius).toBe('');
  });

  it('should handle missing bg-opacity and default to full opacity', () => {
    section1.classList.remove('bg-opacity-60');
    section2.classList.remove('bg-opacity-80');

    applyBackgroundStylesFromMetadata(main);

    expect(section1.style.backgroundColor).toBe('rgb(0, 30, 137)');
    expect(section2.style.backgroundColor).toBe('rgb(255, 0, 0)');
  });

  it('should apply border-radius correctly based on multiple corner classes', () => {
    applyBackgroundStylesFromMetadata(main);

    expect(section1.style.borderRadius).toBe('0 0 102px 0'); // Only br
    expect(section2.style.borderRadius).toBe('102px 102px 0 0'); // tl & tr
  });
});

describe('decodeHTMLEntities', () => {
  it('should decode basic HTML entities', () => {
    expect(decodeHTMLEntities('&lt;div&gt;Test&lt;/div&gt;')).toBe('<div>Test</div>');
  });

  it('should decode ampersand', () => {
    expect(decodeHTMLEntities('Tom &amp; Jerry')).toBe('Tom & Jerry');
  });

  it('should decode quotes', () => {
    expect(decodeHTMLEntities('&quot;double&quot; &#39;single&#39;')).toBe('"double" \'single\'');
  });

  it('should return the same string if there are no entities', () => {
    expect(decodeHTMLEntities('Hello World')).toBe('Hello World');
  });

  it('should handle an empty string', () => {
    expect(decodeHTMLEntities('')).toBe('');
  });

  it('should decode a mix of HTML entities', () => {
    const input = '&lt;script&gt;alert(&quot;xss&quot;) &amp; &#39;test&#39;&lt;/script&gt;';
    const expected = `<script>alert("xss") & 'test'</script>`;
    expect(decodeHTMLEntities(input)).toBe(expected);
  });
});

describe('encodeHTMLEntities', () => {
  it('should encode basic HTML characters', () => {
    expect(encodeHTMLEntities('<div>Test</div>')).toBe('&lt;div&gt;Test&lt;/div&gt;');
  });

  it('should encode ampersand', () => {
    expect(encodeHTMLEntities('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('should encode quotes', () => {
    expect(encodeHTMLEntities('"double" \'single\'')).toBe('&quot;double&quot; &#39;single&#39;');
  });

  it('should return the same string if there are no special characters', () => {
    expect(encodeHTMLEntities('Hello World')).toBe('Hello World');
  });

  it('should handle an empty string', () => {
    expect(encodeHTMLEntities('')).toBe('');
  });

  it('should encode a mix of special characters', () => {
    const input = `<script>alert("xss") & 'test'</script>`;
    const expected = '&lt;script&gt;alert(&quot;xss&quot;) &amp; &#39;test&#39;&lt;/script&gt;';
    expect(encodeHTMLEntities(input)).toBe(expected);
  });
});
