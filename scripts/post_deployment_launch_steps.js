const { config, ethers, getNamedAccounts, deployments: { get } } = require("hardhat");

async function main() {
    const accounts = await getNamedAccounts();
    const { deployer } = accounts;
    const treasuryAddress = (await get('OlympusTreasury')).address;
    const distributorAddress = (await get('Distributor')).address;
    const fraxBondDepositoryAddress = (await get('FraxBondDepository')).address;
    const wftmBondDepositoryAddress = (await get('WftmBondDepository')).address;

    console.log(`deployer is ${deployer}`);
    console.log(`Treasury address is ${treasuryAddress}`);
    console.log(`Distributor address is ${distributorAddress}`);
    console.log(`FRAX bond depository address is ${fraxBondDepositoryAddress}`);
    console.log(`WFTM bond depository address is ${wftmBondDepositoryAddress}`);

    const zeroAddress = config.contractAddresses.zero;
    const treasury = (
      await ethers.getContractFactory('OlympusTreasury')
    ).attach(treasuryAddress);

    const currentBlockNumber = await ethers.provider.getBlockNumber();

    const fraxBondDepositoryToggleBlockNumber = await treasury.reserveDepositorQueue(fraxBondDepositoryAddress);
    const wftmBondDepositoryToggleBlockNumber = await treasury.reserveDepositorQueue(wftmBondDepositoryAddress);

    console.log(`currentBlockNumber is ${currentBlockNumber}`);
    console.log(`fraxBondDepositoryToggleBlockNumber is ${fraxBondDepositoryToggleBlockNumber}`);
    console.log(`wftmBondDepositoryToggleBlockNumber is ${wftmBondDepositoryToggleBlockNumber}`);

    if (
      currentBlockNumber > fraxBondDepositoryToggleBlockNumber &&
      currentBlockNumber > wftmBondDepositoryToggleBlockNumber
    ) {
      await treasury.toggle('0', fraxBondDepositoryAddress, zeroAddress);
      await treasury.toggle('0', wftmBondDepositoryAddress, zeroAddress);
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
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
