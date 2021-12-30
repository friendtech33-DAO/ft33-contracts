const { config, getChainId, ethers } = require("hardhat");
const getTokenAddress = require("../utils/getTokenAddress");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const brickArtifact = await get('OlympusERC20Token');
  const treasuryArtifact = await get('OlympusTreasury');
  // TODO: Setting it to our Fantom multi-sig for now, not sure what to put yet.
  const daoAddress = config.contractAddresses[chainId].dao;
  const priceFeedAddress = config.contractAddresses[chainId].priceFeed;

  const wrappedTokenAddress = await getTokenAddress({ chainId, tokenName: 'wrappedToken', get });

  // NOTE: https://hardhat.org/guides/compile-contracts.html#reading-artifacts
  const contractPath = 'contracts/wETHBondDepository.sol:OlympusBondDepository';

  const deployment = await deploy('WrappedTokenBondDepository', {
    contract: contractPath,
    from: deployer,
    args: [
      brickArtifact.address,
      wrappedTokenAddress,
      treasuryArtifact.address,
      daoAddress,
      priceFeedAddress,
    ],
    log: true,
  });

  const treasury = (
    await ethers.getContractFactory('OlympusTreasury')
  ).attach(treasuryArtifact.address);
  // NOTE: Grant Wrapped Token bond depositor a reserve depositor role
  await treasury.queue('0', deployment.address);

  const wrappedTokenBond = (await ethers.getContractFactory(contractPath)).attach(deployment.address);

  // // NOTE: Use staking helper.
  const stakingHelperArtifact = await get('StakingHelper');
  await wrappedTokenBond.setStaking(stakingHelperArtifact.address, true);

  // TODO: Just copying params from
  // https://etherscan.io/tx/0x89e196f369a21994d863a2f4aaa0ea7fb0970418b98435dcf5efa87c2d5f66b4 (OlympusDAO: ETH Bond V2 initializeBondTerms)
  // for now. Need to adjust at least BCV, bondVestingLength, minBondPrice, maxBondPayout.
  const bondBcv = 2586;

  // 5 days
  const bondVestingLength = 432000;

  const minBondPrice = 1440;

  // 0.004% of BRICK supply
  const maxBondPayout = 4

  const maxBondDebt = ethers.utils.parseUnits('1000000000', 9);
  const initialBondDebt = 0;

  // NOTE: this needs to be set twice to avoid division by 0 error.
  await wrappedTokenBond.setBondTerms('0', bondVestingLength);

  await wrappedTokenBond.initializeBondTerms(
    bondBcv,
    bondVestingLength,
    minBondPrice,
    maxBondPayout,
    maxBondDebt,
    initialBondDebt,
  );
};
module.exports.tags = ['BondDepository', 'AllEnvironments'];