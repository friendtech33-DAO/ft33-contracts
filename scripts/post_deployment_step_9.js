const { config, ethers, deployments: { get } } = require("hardhat");

async function main() {
    const treasuryArtifact = await get('OlympusTreasury');
    const wrappedTokenBondDepositoryArtifact = await get('WrappedTokenBondDepository');

    const treasury = (
      await ethers.getContractFactory('OlympusTreasury')
    ).attach(treasuryArtifact.address);

    // 5 days
    const bondVestingLength = 432000;
    const initialBondDebt = 0;

    // Step 9: Set Wrapped token (WETH/WFTM/etc) bond terms
    // NOTE: Grant Wrapped Token bond depositor a reserve depositor role
    const reserveDepositorQueueTimestamp = await treasury.reserveDepositorQueue(wrappedTokenBondDepositoryArtifact.address);
    if (reserveDepositorQueueTimestamp.eq(0)) {
      await treasury.queue('0', wrappedTokenBondDepositoryArtifact.address);
    }

    const wrappedTokenBond = (
      await ethers.getContractFactory('contracts/wETHBondDepository.sol:OlympusBondDepository')
    ).attach(wrappedTokenBondDepositoryArtifact.address);

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
