module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const stakingArtifact = await get('OlympusStaking');
  const brickArtifact = await get('OlympusERC20Token');
  const sfBrickArtifact = await get('sOlympus');

  await deploy('wOHM', {
    from: deployer,
    args: [
      stakingArtifact.address,
      brickArtifact.address,
      sfBrickArtifact.address
    ],
    log: true,
  });
};
module.exports.tags = ['wsfBRICK', 'AllEnvironments'];