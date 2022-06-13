const { config } = require("hardhat");
const getTokenAddress = require("../utils/getTokenAddress");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const chainId = await getChainId();
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const brickArtifact = await get('OlympusERC20Token');

  const fraxAddress = await getTokenAddress({ chainId, tokenName: 'frax', get });
  const wrappedTokenAddress = await getTokenAddress({ chainId, tokenName: 'wrappedToken', get });

  const blocksNeededForQueue = config.protocolParameters[chainId].blocksNeededForQueue;

  await deploy('OlympusTreasury', {
    from: deployer,
    args: [
      brickArtifact.address,
      fraxAddress,
      wrappedTokenAddress,
      blocksNeededForQueue
    ],
    log: true,
  });
};
module.exports.tags = ['Treasury', 'AllEnvironments'];