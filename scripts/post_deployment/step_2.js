const { config, ethers, deployments: { get } } = require("hardhat");

async function main() {
    const brickArtifact = await get('OlympusERC20Token');
    const treasuryArtifact = await get('OlympusTreasury');

    // Step 2: set Brick vault
    const brick = (
      await ethers.getContractFactory('OlympusERC20Token')
    ).attach(brickArtifact.address);
    const currentVault = await brick.vault();
    if (currentVault === config.contractAddresses.zero) {
      await brick.setVault(treasuryArtifact.address);
    }
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
