const { ethers, deployments: { get } } = require("hardhat");

async function main() {
    const treasuryArtifact = await get('OlympusTreasury');
    const distributorArtifact = await get('Distributor');

    const treasury = (
      await ethers.getContractFactory('OlympusTreasury')
    ).attach(treasuryArtifact.address);

    // Step 4: Set distributor as the reward manager
    const rewardManagerQueueTimestamp = await treasury.rewardManagerQueue(distributorArtifact.address);
    if (rewardManagerQueueTimestamp.eq(0)) {
      await treasury.queue('8', distributorArtifact.address);
    }
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
