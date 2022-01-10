const { deployments, getChainId, config } = require("hardhat");

async function main() {
    // TODO:
    // whitelist BRICK-FRAX pool in Treasury, initialize bond terms
    const chainId = await getChainId();
    // restrict this to testnets for now
    if (['4', '4002'].indexOf(chainId) === -1) {
        throw new Error('This can only be done on testnets!');
    }

    const { deploy, get } = deployments;
    const { deployer } = await getNamedAccounts();

    const brickArtifact = await get('OlympusERC20Token');
    const treasuryArtifact = await get('OlympusTreasury');
    // TODO: Setting DAO address to our Fantom multi-sig for now, not sure what to put yet.
    const { brickFraxUniswapV2Pair, dao } = config.contractAddresses[chainId];
    const bondCalculatorArtifact = await get('OlympusBondingCalculator');

    // NOTE: https://hardhat.org/guides/compile-contracts.html#reading-artifacts
    const contractPath = 'contracts/BondDepository.sol:OlympusBondDepository';

    const deployment = await deploy('BrickFraxBondDepository', {
        contract: contractPath,
        from: deployer,
        args: [
            brickArtifact.address,
            brickFraxUniswapV2Pair,
            treasuryArtifact.address,
            dao,
            bondCalculatorArtifact.address,
        ],
        log: true,
    });

    console.log(`Deployed to ${deployment.address}`);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
