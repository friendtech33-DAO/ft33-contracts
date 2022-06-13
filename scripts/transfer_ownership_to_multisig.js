const { config, ethers, deployments: { get }, getChainId } = require("hardhat");

async function main() {
    const chainId = await getChainId();
    const multisig = config.contractAddresses[chainId].dao;

    const fBrickAddress = (await get('OlympusERC20Token')).address;
    const fBrick = (
      await ethers.getContractFactory('OlympusERC20Token')
    ).attach(fBrickAddress);
    await fBrick.transferOwnership(multisig);

    const sfBrickAddress = (await get('sOlympus')).address;
    const sfBrick = (
      await ethers.getContractFactory('sOlympus')
    ).attach(sfBrickAddress);
    await sfBrick.pushManagement(multisig);

    const treasuryAddress = (await get('OlympusTreasury')).address;
    const treasury = (
      await ethers.getContractFactory('OlympusTreasury')
    ).attach(treasuryAddress);
    await treasury.pushManagement(multisig);

    const distributorAddress = (await get('Distributor')).address;
    const distributor = (
      await ethers.getContractFactory('Distributor')
    ).attach(distributorAddress);
    await distributor.pushPolicy(multisig);

    const fraxBondDepositoryAddress = (await get('FraxBondDepository')).address;
    const fraxBondDepository = (
      await ethers.getContractFactory('contracts/BondDepository.sol:OlympusBondDepository')
    ).attach(fraxBondDepositoryAddress);
    await fraxBondDepository.pushManagement(multisig);

    const wrappedTokenBondDepositoryAddress = (await get('WrappedTokenBondDepository')).address;
    const wrappedTokenBondDepository = (
      await ethers.getContractFactory('contracts/wETHBondDepository.sol:OlympusBondDepository')
    ).attach(wrappedTokenBondDepositoryAddress);
    await wrappedTokenBondDepository.pushManagement(multisig);

    const stakingAddress = (await get('OlympusStaking')).address;
    const staking = (
      await ethers.getContractFactory('OlympusStaking')
    ).attach(stakingAddress);
    await staking.pushManagement(multisig);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
