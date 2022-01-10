const { config, ethers, deployments: { get } } = require("hardhat");

async function main() {
    const treasuryArtifact = await get('OlympusTreasury');
    const stakingHelperArtifact = await get('StakingHelper');
    const brickFraxBondDepositoryArtifact = await get('BrickFraxBondDepository');

    const treasury = (
      await ethers.getContractFactory('OlympusTreasury')
    ).attach(treasuryArtifact.address);

    // Set BRICK-FRAX bond terms
    // NOTE: Grant BRICK-FRAX bond depositor a liquidity depositor role
    const liquidityDepositorQueueTimestamp = await treasury.LiquidityDepositorQueue(brickFraxBondDepositoryArtifact.address);
    if (liquidityDepositorQueueTimestamp.eq(0)) {
      await treasury.queue('4', brickFraxBondDepositoryArtifact.address);
    }

    const brickFraxBond = (
      await ethers.getContractFactory('contracts/BondDepository.sol:OlympusBondDepository')
    ).attach(brickFraxBondDepositoryArtifact.address);

    // NOTE: Use staking helper.
    const currentStakingHelper = await brickFraxBond.stakingHelper();
    if (currentStakingHelper === config.contractAddresses.zero) {
      await brickFraxBond.setStaking(stakingHelperArtifact.address, true);
    }

    // TODO: Just copying params from
    // https://etherscan.io/tx/0xc83d9c015dcc177284a919d7ac5a53e3bf8788ff9e940b294b58150c53674e17 (Frax V1 bonds initializeBondTerms)
    // for now. Need to adjust at least bondVestingLength, minBondPrice, maxBondPayout.
    const brickFraxBondBCV = 300;

    // 5 days
    const bondVestingLength = 432000;
    const minBrickFraxBondPrice = 29000;
    // 0.05% of BRICK supply
    const maxBrickFraxBondPayout = 50

    // bonding fee given to the DAO (100%)
    const bondFee = 10000;

    const maxBrickFraxBondDebt = ethers.utils.parseUnits('700000', 9);
    const initialBondDebt = 0;

    const currentTerms = await brickFraxBond.terms();
    if (currentTerms.controlVariable.eq(0)) {
      await brickFraxBond.initializeBondTerms(
        brickFraxBondBCV,
        bondVestingLength,
        minBrickFraxBondPrice,
        maxBrickFraxBondPayout,
        bondFee,
        maxBrickFraxBondDebt,
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
