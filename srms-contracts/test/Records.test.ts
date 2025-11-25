import { expect } from "chai";
import hre from "hardhat";
// Import the specific utility function for calculating hashes from strings from Ethers v6.
import { solidityPackedKeccak256 } from "ethers";

// IMPORTANT: This line is often necessary to correctly load the Hardhat Chai Matchers types
// which adds the `.revertedWith` property to Chai's Assertion type.
import "@nomicfoundation/hardhat-chai-matchers";


// Using the type casting fix to satisfy the compiler
const ethers = (hre as any).ethers;

describe("StudentRecordsRegistry", function () {
    let recordsRegistry: any;
    let owner: any;
    let verifier: any;
    let nonOwner: any;

    // Sample data used for testing, now using the correctly imported function
    const recordId1 = solidityPackedKeccak256(["string"], ["UniversityA|Student123|2024-01"]);
    const recordHash1 = solidityPackedKeccak256(["string"], ["RecordHash1_Immutable_Data"]);
    const recordId2 = solidityPackedKeccak256(["string"], ["UniversityA|Student456|2024-01"]);
    const recordHash2 = solidityPackedKeccak256(["string"], ["RecordHash2_Immutable_Data"]);

    // This runs before each test to set up a clean contract instance
    beforeEach(async function () {
        // Get the signers (test accounts from Hardhat's local network)
        [owner, verifier, nonOwner] = await ethers.getSigners();

        // Get the Contract Factory
        const RecordsRegistryFactory = await ethers.getContractFactory("StudentRecordsRegistry");

        // Deploy the contract, setting the 'owner' as the initial owner
        recordsRegistry = await RecordsRegistryFactory.deploy(owner.address);

        // Await deployment. This is the Ethers v6/modern Hardhat way.
        await recordsRegistry.waitForDeployment();
    });

    // --- Deployment and Ownership Tests ---
    describe("Deployment", function () {
        it("Should set the correct initial owner (University)", async function () {
            // recordsRegistry.target is the Ethers v6 way to get the deployed address
            const contractAddress = await recordsRegistry.getAddress();
            expect(await recordsRegistry.owner()).to.equal(owner.address);
        });
    });

    // --- Issuance (Write) Function Tests ---
    describe("Issuance (issueRecord)", function () {
        it("Should allow the owner to issue a new record and emit an event", async function () {
            // Get the block timestamp before the transaction is mined
            const latestBlock = await ethers.provider.getBlock("latest");
            const expectedTimestamp = latestBlock ? latestBlock.timestamp + 1 : 0; // The next block's timestamp

            // Check that the function emits the 'RecordIssued' event with correct data
            await expect(recordsRegistry.issueRecord(recordId1, recordHash1))
                .to.emit(recordsRegistry, "RecordIssued")
                .withArgs(recordId1, owner.address, recordHash1, expectedTimestamp);

            // Verify the hash was stored correctly
            expect(await recordsRegistry.getRecordHash(recordId1)).to.equal(recordHash1);
        });

        it("Should NOT allow a non-owner to issue a record", async function () {
            // Attempt to call the function from a non-owner account and expect it to revert
            await expect(
                recordsRegistry.connect(nonOwner).issueRecord(recordId2, recordHash2)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should NOT allow issuing a record with an ID that already exists", async function () {
            // 1. Issue the record successfully
            await recordsRegistry.issueRecord(recordId1, recordHash1);

            // 2. Attempt to overwrite the record
            await expect(
                recordsRegistry.issueRecord(recordId1, recordHash2)
            ).to.be.revertedWith("Record already issued. Cannot be overwritten.");
        });
    });

    // --- Verification (Read) Function Tests ---
    describe("Verification (getRecordHash)", function () {
        beforeEach(async function () {
            // Ensure a record is issued before reading
            await recordsRegistry.issueRecord(recordId1, recordHash1);
        });

        it("Should allow anyone to retrieve a valid record hash", async function () {
            // Check from the verifier's account (anyone can read)
            const retrievedHash = await recordsRegistry.connect(verifier).getRecordHash(recordId1);
            expect(retrievedHash).to.equal(recordHash1);
        });

        it("Should revert if the record ID is not found", async function () {
            const nonExistentId = solidityPackedKeccak256(["string"], ["Non-existent-ID"]);
            await expect(
                recordsRegistry.getRecordHash(nonExistentId)
            ).to.be.revertedWith("Record not found in the registry.");
        });
    });
});