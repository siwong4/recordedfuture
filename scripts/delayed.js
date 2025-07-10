import { fetchPlaceholders, loadScript } from './aem.js';

const getFormConfig = async () => {
  const placeholders = await fetchPlaceholders();
  const { atmEmbedDev, atmEmbedProd } = placeholders;
  return { atmEmbedDev, atmEmbedProd };
};

const HOST_NAME_PROD = 'www.recordedfuture.com';

const isProdHostName = () => {
  if (window && window.location && window.location.hostname) {
    return window.location.hostname.toLocaleLowerCase().indexOf(HOST_NAME_PROD) > -1;
  }
  return false;
};

export async function addMarTechStack() {
  const { atmEmbedDev, atmEmbedProd } = await getFormConfig();
  const flickerPromise = loadScript('/scripts/flicker.js', { async: '' });
  const atmEmbed = isProdHostName() ? atmEmbedProd : atmEmbedDev;

  const marTechPromise = loadScript(`https://assets.adobedtm.com/7aedbd9f9b5a/7db39ece2feb/launch-${atmEmbed}.min.js`, {
    async: '',
  });

  Promise.all([flickerPromise, marTechPromise])
    .then(() => {})
    .catch((error) => {
      console.error('Error loading one or more scripts:', error);
    });
}

addMarTechStack().catch((err) => {
  console.error(err);
});
