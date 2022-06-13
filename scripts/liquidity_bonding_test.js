const { ethers, deployments: { get }, getChainId, getNamedAccounts } = require("hardhat");

async function main() {
    const chainId = await getChainId();
    const accounts = await getNamedAccounts();
    const { deployer } = accounts;

    const bondAddress = (await get('BrickFraxBondDepository')).address;
    const bondDepository = (
      await ethers.getContractFactory('contracts/BondDepository.sol:OlympusBondDepository')
    ).attach(bondAddress);

    const { brickFraxUniswapV2Pair } = config.contractAddresses[chainId];
    const uniswapV2Pair = (
      await ethers.getContractFactory('@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20')
    ).attach(brickFraxUniswapV2Pair);

    const bondAmount = (await uniswapV2Pair.balanceOf(deployer)).div(100);
    const terms = await bondDepository.terms();
    const minimumPrice = terms.minimumPrice;

    await uniswapV2Pair.approve(bondAddress, bondAmount);
    await bondDepository.deposit(bondAmount, minimumPrice, deployer);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
