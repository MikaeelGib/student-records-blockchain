// srms-contracts/hardhat.config.ts

import "@nomicfoundation/hardhat-toolbox";
import { configVariable, defineConfig } from "hardhat/config";

const config = defineConfig({
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    // FIX: Added 'type: "http"' to satisfy the TypeScript requirement for standard networks.
    localhost: {
      type: "http", 
      chainType: "l1", // This is optional but keeps consistency with your other l1 networks
      url: "http://127.0.0.1:8545",
    },
    
    // KEEP YOUR EXISTING NETWORKS
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
  },
});

export default config;