const { ethers, deployments: { get }, getChainId, config } = require("hardhat");
const IUniswapV2Factory = require("../../abis/IUniswapV2Factory.json");

async function main() {
    const chainId = await getChainId();

    // restrict this to FTM testnet for now
    if (chainId !== '4002') {
        throw new Error('This can only be done on FTM testnet!');
    }

    const brickArtifact = await get('OlympusERC20Token');
    const fraxArtifact = await get('FRAX');

    // TODO: dynamic url based on chain ID
    const [deployer] = await ethers.getSigners();
    const rpcUrl = config.networks.ftmTestnet.url;
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    const uniswapV2Factory = new ethers.Contract(
        config.contractAddresses[chainId].uniswapV2Factory,
        IUniswapV2Factory,
        provider
    );

    let brickFraxPairAddress = await uniswapV2Factory.getPair(
        brickArtifact.address,
        fraxArtifact.address
    );

    if (brickFraxPairAddress === config.contractAddresses.zero) {
        await uniswapV2Factory.connect(deployer).createPair(
            brickArtifact.address,
            fraxArtifact.address
        );
        brickFraxPairAddress = await uniswapV2Factory.getPair(
            brickArtifact.address,
            fraxArtifact.address
        );
    }

    console.log(`BRICK-FRAX pair address is ${brickFraxPairAddress}`);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
