const { ethers, deployments: { get }, getChainId, getNamedAccounts } = require("hardhat");
const getTokenAddress = require("../utils/getTokenAddress");

async function main() {
    const chainId = await getChainId();
    const accounts = await getNamedAccounts();
    const { deployer } = accounts;

    const fraxBondDepositoryAddress = (await get('FraxBondDepository')).address;
    const fraxBondDepository = (
      await ethers.getContractFactory('contracts/BondDepository.sol:OlympusBondDepository')
    ).attach(fraxBondDepositoryAddress);

    const fraxAddress = await getTokenAddress({ chainId, tokenName: 'frax', get });
    const frax = (
      await ethers.getContractFactory('@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20')
    ).attach(fraxAddress);

    const bondAmount = ethers.utils.parseEther('10');
    const terms = await fraxBondDepository.terms();
    const minimumPrice = terms.minimumPrice;

    await frax.approve(fraxBondDepositoryAddress, bondAmount);
    await fraxBondDepository.deposit(bondAmount, minimumPrice, deployer);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
