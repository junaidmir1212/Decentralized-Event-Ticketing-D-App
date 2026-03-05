const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const EventTicketing = await hre.ethers.getContractFactory("EventTicketing");
  const contract = await EventTicketing.deploy();
  await contract.deployed();

  console.log("EventTicketing deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
