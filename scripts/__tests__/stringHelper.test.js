// Importing required dependencies

import generateId from '../stringHelper.js';

describe('generateId', () => {
  it('should generate an ID of the specified length', () => {
    const length = 10;
    const result = generateId(length);
    expect(result).toHaveLength(length);
  });

  it('should generate an ID containing only valid characters', () => {
    const length = 20;
    const validCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const result = generateId(length);

    result.split('').forEach((char) => {
      expect(validCharacters).toContain(char);
    });
  });

  it('should generate different IDs on multiple calls', () => {
    const length = 15;
    const id1 = generateId(length);
    const id2 = generateId(length);

    expect(id1).not.toEqual(id2);
  });

  it('should return an empty string when length is 0', () => {
    expect(generateId(0)).toBe('');
    expect(generateId(undefined)).toBe('');
    expect(generateId(null)).toBe('');
  });

  it('should handle errorneous input gracefully', () => {
    expect(generateId(undefined)).toBe('');
    expect(generateId(null)).toBe('');
  });

  it('should handle a large length gracefully', () => {
    const length = 1000;
    const result = generateId(length);
    expect(result).toHaveLength(length);
  });
});
