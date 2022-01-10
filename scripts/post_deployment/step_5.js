const { ethers, deployments: { get } } = require("hardhat");

async function main() {
    const sBrickArtifact = await get('sOlympus');
    const treasuryArtifact = await get('OlympusTreasury');

    const treasury = (
      await ethers.getContractFactory('OlympusTreasury')
    ).attach(treasuryArtifact.address);

    // Step 5: Set sBrick in the treasury
    const sBrickQueue = await treasury.sOHMQueue();
    if (sBrickQueue.eq(0)) {
      await treasury.queue('9', sBrickArtifact.address);
    }
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
