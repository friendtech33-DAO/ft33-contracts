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
  // NOTE: Only LP bond requires bond calculator
  const bondCalculatorAddress = config.contractAddresses.zero;

  const fraxAddress = await getTokenAddress({ chainId, tokenName: 'frax', get });

  // NOTE: https://hardhat.org/guides/compile-contracts.html#reading-artifacts
  const contractPath = 'contracts/BondDepository.sol:OlympusBondDepository';

  const deployment = await deploy('FraxBondDepository', {
    contract: contractPath,
    from: deployer,
    args: [
      brickArtifact.address,
      fraxAddress,
      treasuryArtifact.address,
      daoAddress,
      bondCalculatorAddress,
    ],
    log: true,
  });

  const treasury = (
    await ethers.getContractFactory('OlympusTreasury')
  ).attach(treasuryArtifact.address);
  // NOTE: Grant FRAX bond depositor a reserve depositor role
  const reserveDepositorQueueTimestamp = await treasury.reserveDepositorQueue(deployment.address);
  if (reserveDepositorQueueTimestamp.eq(0)) {
    await treasury.queue('0', deployment.address);
  }

  const fraxBond = (await ethers.getContractFactory(contractPath)).attach(deployment.address);

  // NOTE: Use staking helper.
  const currentStakingHelper = await fraxBond.stakingHelper();
  if (currentStakingHelper === config.contractAddresses.zero) {
    const stakingHelperArtifact = await get('StakingHelper');
    await fraxBond.setStaking(stakingHelperArtifact.address, true);
  }

  // TODO: Just copying params from
  // https://etherscan.io/tx/0xc83d9c015dcc177284a919d7ac5a53e3bf8788ff9e940b294b58150c53674e17 (Frax V1 bonds initializeBondTerms)
  // for now. Need to adjust at least bondVestingLength, minBondPrice, maxBondPayout.
  const fraxBondBCV = 300;

  // 5 days
  const bondVestingLength = 432000;

  const minBondPrice = 29000;

  // 0.05% of BRICK supply
  const maxBondPayout = 50

  // bonding fee given to the DAO (100%)
  const bondFee = 10000;

  const maxBondDebt = ethers.utils.parseUnits('700000', 9);
  const initialBondDebt = 0;

  const currentTerms = await fraxBond.terms();
  if (currentTerms.controlVariable.eq(0)) {
    await fraxBond.initializeBondTerms(
      fraxBondBCV,
      bondVestingLength,
      minBondPrice,
      maxBondPayout,
      bondFee,
      maxBondDebt,
      initialBondDebt,
    );
  }
};
module.exports.tags = ['FraxBondDepository', 'AllEnvironments'];