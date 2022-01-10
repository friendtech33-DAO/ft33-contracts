const { config, ethers, deployments: { get } } = require("hardhat");

async function main() {
    const zeroAddress = config.contractAddresses.zero;
    const stakingArtifact = await get('OlympusStaking');
    const distributorArtifact = await get('Distributor');
    const stakingWarmupArtifact = await get('StakingWarmup');

    // Step 6: Set staking distributor and staking warmup
    const staking = (
      await ethers.getContractFactory('OlympusStaking')
    ).attach(stakingArtifact.address);

    const currentDistributor = await staking.distributor();
    if (currentDistributor === zeroAddress) {
      await staking.setContract('0', distributorArtifact.address);
    }
    const currentWarmupContract = await staking.warmupContract();
    if (currentWarmupContract === zeroAddress) {
      await staking.setContract('1', stakingWarmupArtifact.address);
    }
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
