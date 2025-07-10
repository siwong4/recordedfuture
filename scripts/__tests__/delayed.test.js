import { fetchPlaceholders, loadScript } from '../aem.js';
import { addMarTechStack } from '../delayed.js'; // Replace with actual module path

jest.mock('../aem.js', () => ({
  fetchPlaceholders: jest.fn(),
  loadScript: jest.fn(),
}));

describe('addMarTechStack', () => {
  let originalLocation;

  beforeAll(() => {
    // Save the original window.location object
    originalLocation = window.location;
    // Mock window.location
    delete window.location;
    window.location = { hostname: '' }; // Empty or any value you need
  });

  afterAll(() => {
    // Restore the original window.location object after tests
    window.location = originalLocation;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load the correct prod scripts based on the hostname', async () => {
    // Mock the return value of fetchPlaceholders
    fetchPlaceholders.mockResolvedValue({
      atmEmbedDev: 'devValue',
      atmEmbedProd: 'prodValue',
    });

    // Mock the loadScript function to resolve successfully
    loadScript.mockResolvedValue();

    // Test with hostname containing 'www.recordedfuture.com'
    window.location.hostname = 'www.recordedfuture.com';

    await addMarTechStack();

    expect(loadScript).toHaveBeenCalledTimes(2);
    expect(loadScript).toHaveBeenCalledWith(
      'https://assets.adobedtm.com/7aedbd9f9b5a/7db39ece2feb/launch-prodValue.min.js',
      { async: '' }
    );
  });

  it('should load the correct prod scripts based on the capitalized hostname', async () => {
    // Mock the return value of fetchPlaceholders
    fetchPlaceholders.mockResolvedValue({
      atmEmbedDev: 'devValue',
      atmEmbedProd: 'prodValue',
    });

    // Mock the loadScript function to resolve successfully
    loadScript.mockResolvedValue();

    // Test with hostname containing 'www.recordedfuture.com'
    window.location.hostname = 'www.RECORDEDFUTURE.com';

    await addMarTechStack();

    expect(loadScript).toHaveBeenCalledTimes(2);
    expect(loadScript).toHaveBeenCalledWith(
      'https://assets.adobedtm.com/7aedbd9f9b5a/7db39ece2feb/launch-prodValue.min.js',
      { async: '' }
    );
  });

  it('should load the correct dev scripts based on the hostname', async () => {
    // Mock the return value of fetchPlaceholders
    fetchPlaceholders.mockResolvedValue({
      atmEmbedDev: 'devValue',
      atmEmbedProd: 'prodValue',
    });

    // Mock the loadScript function to resolve successfully
    loadScript.mockResolvedValue();

    // Reset hostname and test again with a different value
    window.location.hostname = 'www.otherdomain.com';

    await addMarTechStack();

    expect(loadScript).toHaveBeenCalledTimes(2);
    expect(loadScript).toHaveBeenCalledWith(
      'https://assets.adobedtm.com/7aedbd9f9b5a/7db39ece2feb/launch-devValue.min.js',
      { async: '' }
    );
  });

  it('should handle errors if scripts fail to load', async () => {
    // Mock the return value of fetchPlaceholders
    fetchPlaceholders.mockResolvedValue({
      atmEmbedDev: 'devValue',
      atmEmbedProd: 'prodValue',
    });

    // Mock loadScript to reject with an error
    const error = new Error('Failed to load script');
    loadScript.mockRejectedValue(error);

    console.error = jest.fn(); // Mock console.error to prevent actual logging

    try {
      await addMarTechStack();
    } catch (error) {
      expect(console.error).toHaveBeenCalledWith('Error loading one or more scripts:', error);
    }
  });
});
