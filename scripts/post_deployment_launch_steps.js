const { config, ethers, getNamedAccounts, deployments: { get } } = require("hardhat");

async function main() {
    const accounts = await getNamedAccounts();
    const { deployer } = accounts;
    const treasuryAddress = (await get('OlympusTreasury')).address;
    const distributorAddress = (await get('Distributor')).address;
    const fraxBondDepositoryAddress = (await get('FraxBondDepository')).address;
    const wrappedTokenBondDepositoryAddress = (await get('WrappedTokenBondDepository')).address;

    console.log(`deployer is ${deployer}`);
    console.log(`Treasury address is ${treasuryAddress}`);
    console.log(`Distributor address is ${distributorAddress}`);
    console.log(`FRAX bond depository address is ${fraxBondDepositoryAddress}`);
    console.log(`Wrapped Token bond depository address is ${wrappedTokenBondDepositoryAddress}`);

    const zeroAddress = config.contractAddresses.zero;
    const treasury = (
      await ethers.getContractFactory('OlympusTreasury')
    ).attach(treasuryAddress);

    const currentBlockNumber = await ethers.provider.getBlockNumber();

    const fraxBondDepositoryToggleBlockNumber = await treasury.reserveDepositorQueue(fraxBondDepositoryAddress);
    const wrappedTokenBondDepositoryToggleBlockNumber = await treasury.reserveDepositorQueue(wrappedTokenBondDepositoryAddress);

    console.log(`currentBlockNumber is ${currentBlockNumber}`);
    console.log(`fraxBondDepositoryToggleBlockNumber is ${fraxBondDepositoryToggleBlockNumber}`);
    console.log(`wrappedTokenBondDepositoryToggleBlockNumber is ${wrappedTokenBondDepositoryToggleBlockNumber}`);

    if (
      currentBlockNumber > fraxBondDepositoryToggleBlockNumber &&
      currentBlockNumber > wrappedTokenBondDepositoryToggleBlockNumber
    ) {
      await treasury.toggle('0', fraxBondDepositoryAddress, zeroAddress);
      await treasury.toggle('0', wrappedTokenBondDepositoryAddress, zeroAddress);
    }

    // approve deployer as the reserve and liquidity token depositor
    const deployerReserveDepositorToggleBlockNumber = await treasury.reserveDepositorQueue(deployer);
    const deployerLiquidityDepositorToggleBlockNumber = await treasury.LiquidityDepositorQueue(deployer);

    console.log(`deployerReserveDepositorToggleBlockNumber is ${deployerReserveDepositorToggleBlockNumber}`);
    console.log(`deployerLiquidityDepositorToggleBlockNumber is ${deployerLiquidityDepositorToggleBlockNumber}`);

    if (
      currentBlockNumber > deployerReserveDepositorToggleBlockNumber &&
      currentBlockNumber > deployerLiquidityDepositorToggleBlockNumber
    ) {
      await treasury.toggle('0', deployer, zeroAddress);
      await treasury.toggle('4', deployer, zeroAddress);
    }

    // approve staking distributor as the reward manager
    const distributorRewardManagerToggleBlockNumber = await treasury.rewardManagerQueue(distributorAddress);
    console.log(`distributorRewardManagerToggleBlockNumber is ${distributorRewardManagerToggleBlockNumber}`);
    if (currentBlockNumber > distributorRewardManagerToggleBlockNumber) {
      await treasury.toggle('8', distributorAddress, zeroAddress);
    }

    const sBrickArtifact = await get('sOlympus');
    const sBrickAddress = sBrickArtifact.address;
    await treasury.toggle('9', sBrickAddress, zeroAddress);

    const stakingArtifact = await get('OlympusStaking');

    const sBrick = (
      await ethers.getContractFactory('sOlympus')
    ).attach(sBrickArtifact.address);

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
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
