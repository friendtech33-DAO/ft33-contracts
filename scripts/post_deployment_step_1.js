const { config, ethers, deployments: { get } } = require("hardhat");

async function main() {
    const sBrickArtifact = await get('sOlympus');
    const stakingArtifact = await get('OlympusStaking');

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
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
