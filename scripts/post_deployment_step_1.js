const { config, ethers, getNamedAccounts, deployments: { get } } = require("hardhat");

async function main() {
    const zeroAddress = config.contractAddresses.zero;
    const { deployer } = await getNamedAccounts();
    const brickArtifact = await get('OlympusERC20Token');
    const sBrickArtifact = await get('sOlympus');
    const stakingArtifact = await get('OlympusStaking');
    const treasuryArtifact = await get('OlympusTreasury');
    const distributorArtifact = await get('Distributor');
    const stakingWarmupArtifact = await get('StakingWarmup');
    const stakingHelperArtifact = await get('StakingHelper');
    const fraxBondDepositoryArtifact = await get('FraxBondDepository');
    const wrappedTokenBondDepositoryArtifact = await get('WrappedTokenBondDepository');

    const sBrick = (
      await ethers.getContractFactory('sOlympus')
    ).attach(sBrickArtifact.address);

    // Step 1: initialize sBrick and set initial index
    const currentStakingContract = await sBrick.stakingContract();
    if (currentStakingContract === config.contractAddresses.zero) {
      await sBrick.initialize(stakingArtifact.address);
    }

    // TODO: What should index be?
    // Copied from SQUID for now
    // https://etherscan.io/tx/0x927640e4d8fb17f859472ec9c54b8c0f6ebe8ec1f1747c61447111dc49185019
    const currentIndex = await sBrick.INDEX();
    if (currentIndex.eq(0)) {
      const index = 1000000000;
      await sBrick.setIndex(index);
    }

    // Step 2: set Brick vault
    const brick = (
      await ethers.getContractFactory('OlympusERC20Token')
    ).attach(brickArtifact.address);
    const currentVault = await brick.vault();
    if (currentVault === config.contractAddresses.zero) {
      await brick.setVault(treasuryArtifact.address);
    }

    // Step 3: set deployer as reserve and liquidity depositor
    const treasury = (
      await ethers.getContractFactory('OlympusTreasury')
    ).attach(treasuryArtifact.address);

    // NOTE: make deployer address an approved reserve and liquidity token depositor
    const reserveDepositorQueueTimestamp = await treasury.reserveDepositorQueue(deployer);
    if (reserveDepositorQueueTimestamp.eq(0)) {
      await treasury.queue('0', deployer);
    }

    const liquidityDepositorQueueTimestamp = await treasury.LiquidityDepositorQueue(deployer);
    if (liquidityDepositorQueueTimestamp.eq(0)) {
      await treasury.queue('4', deployer);
    }

    // Step 4: Set distributor as the reward manager
    const rewardManagerQueueTimestamp = await treasury.rewardManagerQueue(distributorArtifact.address);
    if (rewardManagerQueueTimestamp.eq(0)) {
      await treasury.queue('8', distributorArtifact.address);
    }

    // Step 5: Set sBrick in the treasury
    const sBrickQueue = await treasury.sOHMQueue();
    if (sBrickQueue.eq(0)) {
      await treasury.queue('9', sBrickArtifact.address);
    }

    // Step 6: Set staking distributor and staking warmup
    const staking = (
      await ethers.getContractFactory('OlympusStaking')
    ).attach(stakingArtifact.address);

    const currentDistributor = await staking.distributor();
    if (currentDistributor === zeroAddress) {
      await staking.setContract('0', distributorArtifact.address);
    }
    const currentWarmupContract = await staking.warmupContract();
    if (currentWarmupContract === zeroAddress) {
      await staking.setContract('1', stakingWarmupArtifact.address);
    }

    // Step 7: add reward recipient
    const distributor = (
      await ethers.getContractFactory('Distributor')
    ).attach(distributorArtifact.address);

    try {
      await distributor.info(0);
    } catch {
      // NOTE: No recipient, can safely add
      // TODO: confirm with the team, this is 0.3% per epoch
      const initialRewardRate = 3000;
      await distributor.addRecipient(stakingArtifact.address, initialRewardRate);
    }

    // Step 8: Set Frax bond terms
    // NOTE: Grant FRAX bond depositor a reserve depositor role
    const reserveDepositorQueueTimestamp = await treasury.reserveDepositorQueue(fraxBondDepositoryArtifact.address);
    if (reserveDepositorQueueTimestamp.eq(0)) {
      await treasury.queue('0', fraxBondDepositoryArtifact.address);
    }

    const fraxBond = (
      await ethers.getContractFactory('contracts/BondDepository.sol:OlympusBondDepository')
    ).attach(fraxBondDepositoryArtifact.address);

    // NOTE: Use staking helper.
    const currentStakingHelper = await fraxBond.stakingHelper();
    if (currentStakingHelper === config.contractAddresses.zero) {
      await fraxBond.setStaking(stakingHelperArtifact.address, true);
    }

    // TODO: Just copying params from
    // https://etherscan.io/tx/0xc83d9c015dcc177284a919d7ac5a53e3bf8788ff9e940b294b58150c53674e17 (Frax V1 bonds initializeBondTerms)
    // for now. Need to adjust at least bondVestingLength, minBondPrice, maxBondPayout.
    const fraxBondBCV = 300;

    // 5 days
    const bondVestingLength = 432000;
    const minFraxBondPrice = 29000;
    // 0.05% of BRICK supply
    const maxFraxBondPayout = 50

    // bonding fee given to the DAO (100%)
    const bondFee = 10000;

    const maxFraxBondDebt = ethers.utils.parseUnits('700000', 9);
    const initialBondDebt = 0;

    const currentTerms = await fraxBond.terms();
    if (currentTerms.controlVariable.eq(0)) {
      await fraxBond.initializeBondTerms(
        fraxBondBCV,
        bondVestingLength,
        minFraxBondPrice,
        maxFraxBondPayout,
        bondFee,
        maxFraxBondDebt,
        initialBondDebt,
      );
    }

    // Step 9: Set Wrapped token (WETH/WFTM/etc) bond terms
    // NOTE: Grant Wrapped Token bond depositor a reserve depositor role
    const reserveDepositorQueueTimestamp = await treasury.reserveDepositorQueue(wrappedTokenBondDepositoryArtifact.address);
    if (reserveDepositorQueueTimestamp.eq(0)) {
      await treasury.queue('0', wrappedTokenBondDepositoryArtifact.address);
    }

    const wrappedTokenBond = (
      await ethers.getContractFactory('contracts/wETHBondDepository.sol:OlympusBondDepository')
    ).attach(deployment.address);

    // // NOTE: Use staking helper.
    const currentStakingHelper = await wrappedTokenBond.stakingHelper();
    if (currentStakingHelper === config.contractAddresses.zero) {
      const stakingHelperArtifact = await get('StakingHelper');
      await wrappedTokenBond.setStaking(stakingHelperArtifact.address, true);
    }

    // TODO: Just copying params from
    // https://etherscan.io/tx/0x89e196f369a21994d863a2f4aaa0ea7fb0970418b98435dcf5efa87c2d5f66b4 (OlympusDAO: ETH Bond V2 initializeBondTerms)
    // for now. Need to adjust at least BCV, bondVestingLength, minBondPrice, maxBondPayout.
    const wrappedTokenBondBcv = 2586;
    const minWrappedTokenBondPrice = 1440;
    // 0.004% of BRICK supply
    const maxWrappedTokenBondPayout = 4
    const maxBondDebt = ethers.utils.parseUnits('1000000000', 9);

    // NOTE: this needs to be set twice to avoid division by 0 error.
    const currentTerms = await wrappedTokenBond.terms();

    if (currentTerms.vestingTerm.eq(0)) {
      await wrappedTokenBond.setBondTerms('0', bondVestingLength);
    }

    if (currentTerms.controlVariable.eq(0)) {
      await wrappedTokenBond.initializeBondTerms(
        wrappedTokenBondBcv,
        bondVestingLength,
        minWrappedTokenBondPrice,
        maxWrappedTokenBondPayout,
        maxBondDebt,
        initialBondDebt,
      );
    }
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
