const { ethers, deployments: { get } } = require("hardhat");

async function main() {
    const stakingArtifact = await get('OlympusStaking');
    const distributorArtifact = await get('Distributor');

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
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
