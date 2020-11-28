const initialSettings = {
  minDepositUnit: '1000000000000000', // 0.001 ETH
  maxDepositAmount: '1000000000000000000000', // 1000 ETH
  validatorDepositAmount: '32000000000000000000', // 32 ETH
  validatorPrice: '10000000000000000000', // 10 DAI / month
  maintainerFee: '1000', // 10%,
  admin: '0x75a92824741CED06213cBcbEBD67d294cA75cc53',
  maintainer: '0x75a92824741CED06213cBcbEBD67d294cA75cc53',
  allContractsPaused: false,
  // TODO: update to mainnet address
  VRC: '0x4dbC57D821378824B280f920D283472a0ffffF76',
  withdrawalCredentials:
    '0x0072ea0cf49536e3c66c787f705186df9a4378083753ae9536d65b3ad7fcddc4',
};

async function deployAndInitializeSettings(
  adminsContractAddress,
  operatorsContractAddress
) {
  const Settings = await ethers.getContractFactory('Settings');
  const proxy = await upgrades.deployProxy(Settings, [
    initialSettings.allContractsPaused,
    initialSettings.maintainerFee,
    initialSettings.minDepositUnit,
    initialSettings.validatorDepositAmount,
    initialSettings.maxDepositAmount,
    initialSettings.validatorPrice,
    initialSettings.maintainer,
    adminsContractAddress,
    operatorsContractAddress,
    initialSettings.withdrawalCredentials,
  ]);
  return proxy.address;
}

module.exports = {
  deployAndInitializeSettings,
  initialSettings,
};
