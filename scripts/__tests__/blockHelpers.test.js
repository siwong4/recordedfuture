// Importing required dependencies (if needed, like Jest DOM for DOM manipulation)
// jest-dom is included in Jest by default with Create React App

import getBlockCfg from '../blockHelpers.js';

describe('getBlockCfg', () => {
  // Mocking the DOM structure
  const createMockBlock = (paragraphs) => {
    const block = document.createElement('div');

    paragraphs.forEach((text) => {
      const p = document.createElement('p');
      p.textContent = text;
      block.appendChild(p);
    });

    return block;
  };

  it('should return the default configuration when block has no valid paragraphs', () => {
    const block = createMockBlock([]); // Empty block
    const defaultCfg = { key1: 'value1', key2: 'value2' };

    const result = getBlockCfg(block, defaultCfg);

    expect(result).toEqual(defaultCfg);
  });

  it('should update the configuration based on valid key-value pairs', () => {
    const block = createMockBlock(['key1', 'value1', 'key2', 'value2']);
    const defaultCfg = { key1: 'defaultValue1', key3: 'defaultValue3' };

    const result = getBlockCfg(block, defaultCfg);

    expect(result).toEqual({
      key1: 'value1', // Overwritten
      key2: 'value2', // Added
      key3: 'defaultValue3', // Remains as is
    });
  });

  it('should skip key-value pairs if key or value is missing', () => {
    const block = createMockBlock(['key1', 'value1', 'key2']); // Missing value for key2
    const defaultCfg = { key1: 'defaultValue1', key3: 'defaultValue3' };

    const result = getBlockCfg(block, defaultCfg);

    expect(result).toEqual({
      key1: 'value1', // Overwritten
      key3: 'defaultValue3', // Remains as is
    });
  });

  it('should handle blocks with an odd number of paragraphs gracefully', () => {
    const block = createMockBlock(['key1', 'value1', 'key2', 'value2', 'key3']); // Odd number of paragraphs
    const defaultCfg = { key1: 'defaultValue1' };

    const result = getBlockCfg(block, defaultCfg);

    expect(result).toEqual({
      key1: 'value1', // Overwritten
      key2: 'value2', // Added
    });
  });

  it('should return an empty object when the default configuration is empty and no valid pairs exist', () => {
    const block = createMockBlock([]);
    const defaultCfg = {};

    const result = getBlockCfg(block, defaultCfg);

    expect(result).toEqual({});
  });
});
