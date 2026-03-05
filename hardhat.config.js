require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { SEPOLIA_RPC_URL, HARDHAT_PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.17",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL || "",
      accounts: HARDHAT_PRIVATE_KEY ? [HARDHAT_PRIVATE_KEY] : [],
    },
  },
};
