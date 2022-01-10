const { ethers, deployments: { get }, getChainId, config } = require("hardhat");
const IUniswapV2Router02 = require("../../abis/IUniswapV2Router02.json");

async function main() {
    // TODO:
    // whitelist BRICK-FRAX pool in Treasury, deploy BRICK-FRAX bond depository, initialize bond terms
    const chainId = await getChainId();
    // restrict this to testnets for now
    if (['4', '4002'].indexOf(chainId) === -1) {
        throw new Error('This can only be done on testnets!');
    }

    const brickArtifact = await get('OlympusERC20Token');
    const fraxArtifact = await get('FRAX');

    const [deployer] = await ethers.getSigners();
    let rpcUrl;
    if (chainId === '4002') {
        rpcUrl = config.networks.ftmTestnet.url;
    } else if (chainId === '4') {
        rpcUrl = config.networks.rinkeby.url;
    }
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    const routerAddress = config.contractAddresses[chainId].uniswapV2Router;
    const uniswapV2Router = new ethers.Contract(
        routerAddress,
        IUniswapV2Router02,
        provider
    );

    const amountBrickDesired = ethers.utils.parseUnits('10000', 9);
    const amountFraxDesired = ethers.utils.parseUnits('40000', 18);

    const brick = (await ethers.getContractFactory("OlympusERC20Token")).attach(brickArtifact.address);
    const frax = (await ethers.getContractFactory("FRAX")).attach(fraxArtifact.address);

    const brickApproval = await brick.connect(deployer).approve(routerAddress, amountBrickDesired);
    const fraxApproval = await frax.connect(deployer).approve(routerAddress, amountFraxDesired);

    await brickApproval.wait();
    await fraxApproval.wait();

    // 20 minutes from now
    const deadline = Math.round((+new Date() / 1000) + 20 * 60);

    const receipt = await uniswapV2Router.connect(deployer).addLiquidity(
        brickArtifact.address,
        fraxArtifact.address,
        amountBrickDesired,
        amountFraxDesired,
        amountBrickDesired,
        amountFraxDesired,
        deployer.address,
        deadline
    );

    console.log(receipt);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
