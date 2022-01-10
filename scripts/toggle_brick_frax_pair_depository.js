const { config, ethers, deployments: { get } } = require("hardhat");

async function main() {
    const zeroAddress = config.contractAddresses.zero;

    const bondAddress = (await get('BrickFraxBondDepository')).address;
    console.log(`Bond depository address is ${bondAddress}`);

    const treasuryAddress = (await get('OlympusTreasury')).address;
    const treasury = (
      await ethers.getContractFactory('OlympusTreasury')
    ).attach(treasuryAddress);

    const currentBlockNumber = await ethers.provider.getBlockNumber();
    console.log(`currentBlockNumber is ${currentBlockNumber}`);

    // approve BRICK-FRAX LP bond depository as liquidity token depositor
    const bondLiquidityDepositorToggleBlockNumber = await treasury.LiquidityDepositorQueue(bondAddress);
    console.log(`bondLiquidityDepositorToggleBlockNumber is ${bondLiquidityDepositorToggleBlockNumber}`);

    if (currentBlockNumber > bondLiquidityDepositorToggleBlockNumber) {
      await treasury.toggle('4', bondAddress, zeroAddress);
    }
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
