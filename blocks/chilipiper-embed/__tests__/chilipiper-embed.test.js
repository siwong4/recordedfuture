/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { loadScript } from '../../../scripts/aem.js';
import { embedChilipiper } from '../chilipiper-embed.js';

jest.mock('../../../scripts/aem.js', () => ({
  loadScript: jest.fn(() => Promise.resolve()),
}));

// Mock global ChiliPiper object
global.ChiliPiper = {
  deploy: jest.fn(),
};

describe('embedChilipiper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call loadScript and ChiliPiper.deploy with correct arguments', async () => {
    const mockParams = {
      jsUrl: 'https://example.com/chilipiper.js',
      domain: 'test-domain',
      router: 'test-router',
      formType: 'test-form',
      target: 'test-target',
    };

    await embedChilipiper(mockParams);

    expect(loadScript).toHaveBeenCalledWith('https://example.com/chilipiper.js?t=test-target', {
      async: 'async',
      defer: 'defer',
    });
    expect(ChiliPiper.deploy).toHaveBeenCalledWith('test-domain', 'test-router', { formType: 'test-form' });
  });

  it('should handle errors when loading the script', async () => {
    const jsUrl = 'https://example.com/chilipiper.js';
    const domain = 'example';
    const router = 'sales';
    const formType = 'inline';
    const target = 'chilipiper-form';

    // Mock loadScript to reject with an error
    loadScript.mockImplementationOnce(() => Promise.reject(new Error('Failed to load script')));

    await expect(
      embedChilipiper({
        jsUrl,
        domain,
        router,
        formType,
        target,
      })
    ).rejects.toThrow('Failed to load script');

    // Assert that ChiliPiper.deploy was not called
    expect(ChiliPiper.deploy).not.toHaveBeenCalled();
  });

  it('should handle errors when deploying ChiliPiper', async () => {
    const jsUrl = 'https://example.com/chilipiper.js';
    const domain = 'example';
    const router = 'sales';
    const formType = 'inline';
    const target = 'chilipiper-form';

    // Mock ChiliPiper.deploy to throw an error
    ChiliPiper.deploy.mockImplementationOnce(() => {
      throw new Error('Failed to deploy ChiliPiper');
    });

    await expect(
      embedChilipiper({
        jsUrl,
        domain,
        router,
        formType,
        target,
      })
    ).rejects.toThrow('Failed to deploy ChiliPiper');

    // Assert that loadScript was called
    expect(loadScript).toHaveBeenCalledWith(`${jsUrl}?t=${target}`, { async: 'async', defer: 'defer' });
  });
});
