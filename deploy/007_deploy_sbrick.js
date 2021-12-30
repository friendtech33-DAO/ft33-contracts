const { ethers } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const chainId = await getChainId();
  const { name, symbol } = config.protocolParameters[chainId].sbrick;

  const deployment = await deploy('sOlympus', {
    from: deployer,
    args: [name, symbol],
    log: true,
  });

  const treasuryAddress = (await get('OlympusTreasury')).address;
  const treasury = (
    await ethers.getContractFactory('OlympusTreasury')
  ).attach(treasuryAddress);
  // NOTE: set sBRICK
  await treasury.queue('9', deployment.address);
};
module.exports.tags = ['sBRICK', 'AllEnvironments'];