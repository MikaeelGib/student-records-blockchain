// srms-contracts/scripts/deploy.ts

// The correct way to import Hardhat Runtime Environment properties in TypeScript 
// is to destructure the needed components directly from the "hardhat" module.
// This ensures TypeScript correctly resolves the extended types (like 'ethers' and 'artifacts').
import { ethers } from "hardhat"; 

async function main() {
  // We now access 'ethers' directly, which is fully typed.
  
  // 1. Get the owner's account
  const [owner] = await ethers.getSigners();
  
  // 2. Get the ContractFactory
  const RecordsRegistryFactory = await ethers.getContractFactory("StudentRecordsRegistry");

  // 3. Deploy the contract, passing the owner's address to the constructor
  // Note: ethers is implicitly connected to the first signer (owner) for deployment
  const recordsRegistry = await RecordsRegistryFactory.deploy(owner.address);
  
  // 4. Wait for the deployment to be mined (Ethers v6 method)
  await recordsRegistry.waitForDeployment();
  
  // 5. Log the deployed address
  console.log(`StudentRecordsRegistry deployed to: ${await recordsRegistry.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});