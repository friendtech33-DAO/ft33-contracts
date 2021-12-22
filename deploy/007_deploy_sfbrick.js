const { ethers } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const deployment = await deploy('sOlympus', {
    from: deployer,
    args: [],
    log: true,
  });

  const treasuryAddress = (await get('OlympusTreasury')).address;
  const treasury = (
    await ethers.getContractFactory('OlympusTreasury')
  ).attach(treasuryAddress);
  // NOTE: set sfBRICK
  await treasury.queue('9', deployment.address);
};
module.exports.tags = ['sfBRICK', 'AllEnvironments'];