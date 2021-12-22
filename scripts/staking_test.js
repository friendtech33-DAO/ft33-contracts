const { ethers, getNamedAccounts, deployments: { get } } = require("hardhat");

async function main() {
    const accounts = await getNamedAccounts();
    const { deployer } = accounts;

    const brickAddress = (await get('OlympusERC20Token')).address;
    const brick = (await ethers.getContractFactory('OlympusERC20Token')).attach(brickAddress);
    const stakingHelperAddress = (await get('StakingHelper')).address;
    const stakingHelper = (await ethers.getContractFactory('StakingHelper')).attach(stakingHelperAddress);
    const stakeAmount = ethers.utils.parseUnits('500000', 9);
    await brick.approve(stakingHelper.address, stakeAmount);
    await stakingHelper.stake(stakeAmount);

    const sfBrickAddress = (await get('sOlympus')).address;
    const sfBrick = (await ethers.getContractFactory('sOlympus')).attach(sfBrickAddress);

    const balance = await sfBrick.balanceOf(deployer.address);
    console.log(`${deployer.adderss} has ${ethers.utils.formatEther(balance)} sfBrick`);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
