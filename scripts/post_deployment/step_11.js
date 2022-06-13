const { ethers, deployments: { get } } = require("hardhat");

async function main() {
  const fraxBondDepositoryArtifact = await get("FraxBondDepository");
  const wrappedTokenBondDepositoryArtifact = await get("WrappedTokenBondDepository");
  const redeemHelperArtifact = await get("RedeemHelper");
  const redeemHelper = (await ethers.getContractFactory("RedeemHelper")).attach(
    redeemHelperArtifact.address
  );

  await redeemHelper.addBondContract(fraxBondDepositoryArtifact.address);
  await redeemHelper.addBondContract(wrappedTokenBondDepositoryArtifact.address);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
