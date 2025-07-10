const getBlockCfg = (block, defaultCfg) => {
  const props = block.querySelectorAll('p');
  const blockCfg = { ...defaultCfg }; // set default

  for (let i = 0; i < props.length; i += 2) {
    if (props[i]?.textContent !== undefined && props[i + 1]?.textContent !== undefined) {
      blockCfg[props[i].textContent] = props[i + 1].textContent;
    }
  }

  return blockCfg;
};

export default getBlockCfg;
