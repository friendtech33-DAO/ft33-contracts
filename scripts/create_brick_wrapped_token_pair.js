const { ethers, deployments: { get }, getChainId, config } = require("hardhat");
const IUniswapV2Factory = require("../abis/IUniswapV2Factory.json");

async function main() {
    // TODO:
    // 1. add liquidity to spiritswap to create a BRICK-WrappedToken pool
    // 2. whitelist BRICK-WrappedToken pool in Treasury, deploy BRICK-WrappedToken bond depository, initialize bond terms
    const chainId = await getChainId();

    // restrict this to FTM testnet for now
    if (chainId !== '4002') {
        throw new Error('This can only be done on FTM testnet!');
    }

    const brickArtifact = await get('OlympusERC20Token');
    const wrappedTokenArtifact = await get('WrappedToken');

    // TODO: dynamic url based on chain ID
    const [deployer] = await ethers.getSigners();
    const rpcUrl = config.networks.ftmTestnet.url;
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    const uniswapV2Factory = new ethers.Contract(
        config.contractAddresses[chainId].uniswapV2Factory,
        IUniswapV2Factory,
        provider
    );

    let brickWrappedTokenPairAddress = await uniswapV2Factory.getPair(
        brickArtifact.address,
        wrappedTokenArtifact.address
    );

    if (brickWrappedTokenPairAddress === config.contractAddresses.zero) {
        await uniswapV2Factory.connect(deployer).createPair(
            brickArtifact.address,
            wrappedTokenArtifact.address
        );
        brickWrappedTokenPairAddress = await uniswapV2Factory.getPair(
            brickArtifact.address,
            wrappedTokenArtifact.address
        );
    }

    console.log(`BRICK-WrappedToken pair address is ${brickWrappedTokenPairAddress}`);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
