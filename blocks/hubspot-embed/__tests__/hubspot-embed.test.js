/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { loadScript } from '../../../scripts/aem.js';
import { embedHubspot } from '../hubspot-embed.js';

jest.mock('../../../scripts/aem.js', () => ({
  ...jest.requireActual('../../../scripts/aem.js'),
  loadScript: jest.fn(() => Promise.resolve()),
}));

// Mock global hbspt object
global.hbspt = {
  forms: {
    create: jest.fn(),
  },
};

describe('embedHubspot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call loadScript and create with correct arguments', async () => {
    const mockParams = {
      jsUrl: 'https://js.hsforms.net/forms/embed/v2.js',
      portalId: 'test-portalId',
      formId: 'test-formId',
      target: 'test-target',
    };

    await embedHubspot(mockParams);

    expect(loadScript).toHaveBeenCalledWith('https://js.hsforms.net/forms/embed/v2.js?t=test-target', {
      async: 'async',
      defer: 'defer',
    });
    expect(hbspt.forms.create).toHaveBeenCalledWith({
      portalId: 'test-portalId',
      formId: 'test-formId',
      target: '#test-target',
      onFormSubmitted: expect.any(Function),
    });
  });

  it('should handle errors when loading the script', async () => {
    const jsUrl = 'https://example.com/hubspot.js';
    const portalId = '12345';
    const formId = '67890';
    const target = 'hubspot-form';

    // Mock loadScript to reject with an error
    loadScript.mockImplementationOnce(() => Promise.reject(new Error('Failed to load script')));

    await expect(
      embedHubspot({
        jsUrl,
        portalId,
        formId,
        target,
      })
    ).rejects.toThrow('Failed to load script');

    // Assert that hbspt.forms.create was not called
    expect(hbspt.forms.create).not.toHaveBeenCalled();
  });

  it('should handle errors when creating the HubSpot form', async () => {
    const jsUrl = 'https://example.com/hubspot.js';
    const portalId = '12345';
    const formId = '67890';
    const target = 'hubspot-form';

    // Mock hbspt.forms.create to throw an error
    hbspt.forms.create.mockImplementationOnce(() => {
      throw new Error('Failed to create form');
    });

    await expect(
      embedHubspot({
        jsUrl,
        portalId,
        formId,
        target,
      })
    ).rejects.toThrow('Failed to create form');

    // Assert that loadScript was called
    expect(loadScript).toHaveBeenCalledWith(`${jsUrl}?t=${target}`, { async: 'async', defer: 'defer' });
  });
});
