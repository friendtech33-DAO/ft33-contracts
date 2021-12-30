const { ethers } = require("hardhat");

module.exports = async ({ deployments }) => {
  const { get } = deployments;

  const sfBrickArtifact = await get('sOlympus');
  const stakingArtifact = await get('OlympusStaking');

  const sfBrick = (
    await ethers.getContractFactory('sOlympus')
  ).attach(sfBrickArtifact.address);

  await sfBrick.initialize(stakingArtifact.address);

  // TODO: What should index be?
  // Copied from SQUID for now
  // https://etherscan.io/tx/0x927640e4d8fb17f859472ec9c54b8c0f6ebe8ec1f1747c61447111dc49185019
  const index = 1000000000;
  await sfBrick.setIndex(index);
};
module.exports.tags = ['sBRICK', 'AllEnvironments'];