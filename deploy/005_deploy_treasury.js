const { config, ethers } = require("hardhat");
const getTokenAddress = require("../utils/getTokenAddress");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const chainId = await getChainId();
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const brickArtifact = await get('OlympusERC20Token');

  const fraxAddress = await getTokenAddress({ chainId, tokenName: 'frax', get });
  const wrappedTokenAddress = await getTokenAddress({ chainId, tokenName: 'wrappedToken', get });

  const blocksNeededForQueue = config.protocolParameters[chainId].blocksNeededForQueue;

  const deployment = await deploy('OlympusTreasury', {
    from: deployer,
    args: [
      brickArtifact.address,
      fraxAddress,
      wrappedTokenAddress,
      blocksNeededForQueue
    ],
    log: true,
  });

  const brick = (
    await ethers.getContractFactory('OlympusERC20Token')
  ).attach(brickArtifact.address);
  await brick.setVault(deployment.address);

  const treasury = (
    await ethers.getContractFactory('OlympusTreasury')
  ).attach(deployment.address);

  // NOTE: make deployer address an approved reserve and liquidity token depositor
  await treasury.queue('0', deployer);
  await treasury.queue('4', deployer);
};
module.exports.tags = ['Treasury', 'AllEnvironments'];