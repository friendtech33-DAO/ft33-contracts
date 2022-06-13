const { ethers, deployments: { get }, getChainId } = require("hardhat");
const getTokenAddress = require("../utils/getTokenAddress");

async function main() {
  const chainId = await getChainId();
  const fraxAddress = await getTokenAddress({ chainId, get, tokenName: 'frax' });
  const frax = (
    await ethers.getContractFactory('@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20')
  ).attach(fraxAddress);
  const treasuryAddress = (await get('OlympusTreasury')).address;

  const treasury = (
    await ethers.getContractFactory('OlympusTreasury')
  ).attach(treasuryAddress);

  // TODO: decide how much to mint and how much is profit
  const transferAmount = ethers.utils.parseUnits('1000000', 18);
  const profit = ethers.utils.parseUnits('500000', 9);
  // const transferAmount = 0;
  // const profit = 0;
  await frax.approve(treasury.address, transferAmount);
  await treasury.deposit(transferAmount, fraxAddress, profit);

  // Next step is to distribute BRICK tokens to CRE8R token holders.
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
