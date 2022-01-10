const { ethers, getNamedAccounts, deployments: { get } } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts();
    const treasuryArtifact = await get('OlympusTreasury');

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
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
