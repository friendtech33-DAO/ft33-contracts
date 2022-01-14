const { ethers, deployments: { get } } = require("hardhat");

async function main() {
  const brickFraxBondDepositoryArtifact = await get("BrickFraxBondDepository");
  const redeemHelperArtifact = await get("RedeemHelper");
  const redeemHelper = (await ethers.getContractFactory("RedeemHelper")).attach(
    redeemHelperArtifact.address
  );

  await redeemHelper.addBondContract(brickFraxBondDepositoryArtifact.address);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
