// srms-contracts/type-extensions.d.ts

// This imports the types for the entire Hardhat Runtime Environment (HRE)
import "hardhat/types"; 

// This imports the types specifically for the Ethers plugin
import "@nomicfoundation/hardhat-ethers";

declare module "hardhat/types/runtime" {
    // We are extending the HRE interface to confirm that the 'ethers' object exists
    // and correctly maps to the Ethers provided by the toolbox plugin.
    export interface HardhatRuntimeEnvironment {
        // NOTE: No need to manually define 'ethers: Ethers' here as the 'hardhat-ethers'
        // plugin import (above) usually handles the extension implicitly.
    }
}