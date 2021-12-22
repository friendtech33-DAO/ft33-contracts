require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");
require("@nomiclabs/hardhat-etherscan");

require("dotenv").config();
const { MAINNET_PRIVATE_KEY, TESTNET_PRIVATE_KEY, FTMSCAN_API_KEY } = process.env;

module.exports = {
  solidity: "0.7.5",
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  networks: {
    opera: {
      chainId: 250,
      url: "https://rpc.ftm.tools",
      accounts: [
        MAINNET_PRIVATE_KEY,
      ]
    },
    ftmTestnet: {
      chainId: 4002,
      url: "https://rpc.testnet.fantom.network",
      accounts: [
        TESTNET_PRIVATE_KEY,
      ],
    },
  },
  protocolParameters: {
    '250': {
      // NOTE: Average block time in Ethereum is ~13 seconds and
      // Olympus's treasury's blocksNeededForQueue is 6,000.
      // Fantom's average block time is ~0.9 seconds so I make it
      // 6,000 / 0.9 which is approximately 6,600 blocks.
      blocksNeededForQueue: 6600,
      epochLength: 28800, // seconds
    },
    '4002': {
      blocksNeededForQueue: 0,
      epochLength: 28800, // seconds
    },
    '31337': {
      blocksNeededForQueue: 0,
      epochLength: 28800, // seconds
    },
  },
  contractAddresses: {
    '250': {
      // TODO: This is our multi-sig (for now).
      dao: '0xba5c251Cffc942C8e16e2315024c7D4B7D76Bea8',
      frax: '0xaf319E5789945197e365E7f7fbFc56B130523B33',
      wrappedToken: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', // WFTM
      priceFeed: '0xf4766552D15AE4d256Ad41B6cf2933482B0680dc',
    },
    '4002': {
      dao: '0xA38F4E6718EdCF023a1d032a2193848CB932c8e3', // testnet deployer address
      priceFeed: '0xe04676B9A9A2973BCb0D1478b5E1E9098BBB7f3D',
    },
    '31337': {
      dao: '0xba5c251Cffc942C8e16e2315024c7D4B7D76Bea8',
      priceFeed: '0xf4766552D15AE4d256Ad41B6cf2933482B0680dc',
    },
    zero: '0x0000000000000000000000000000000000000000',
  },
  etherscan: {
    apiKey: FTMSCAN_API_KEY,
  },
};
