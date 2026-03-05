const { expect } = require("chai");

describe("EventTicketing", function () {
  it("creates event and mints tickets", async function () {
    const [owner, buyer] = await ethers.getSigners();

    const EventTicketing = await ethers.getContractFactory("EventTicketing");
    const c = await EventTicketing.deploy();
    await c.deployed();

    await expect(c.createEvent("UEL Fest", 2, ethers.utils.parseEther("0.01")))
      .to.emit(c, "EventCreated");

    // mint 1st ticket
    await expect(
      c.connect(buyer).mintTicket(0, "ipfs://example", { value: ethers.utils.parseEther("0.01") })
    ).to.emit(c, "TicketMinted");

    expect(await c.ownerOf(0)).to.equal(buyer.address);

    // mint 2nd ticket
    await c.connect(buyer).mintTicket(0, "ipfs://example2", { value: ethers.utils.parseEther("0.01") });
    expect(await c.ownerOf(1)).to.equal(buyer.address);

    // sold out
    await expect(
      c.connect(buyer).mintTicket(0, "ipfs://example3", { value: ethers.utils.parseEther("0.01") })
    ).to.be.revertedWith("sold out");
  });

  it("rejects insufficient payment", async function () {
    const [owner, buyer] = await ethers.getSigners();
    const EventTicketing = await ethers.getContractFactory("EventTicketing");
    const c = await EventTicketing.deploy();
    await c.deployed();

    await c.createEvent("Cheap", 1, ethers.utils.parseEther("0.01"));
    await expect(
      c.connect(buyer).mintTicket(0, "ipfs://x", { value: ethers.utils.parseEther("0.001") })
    ).to.be.revertedWith("insufficient payment");
  });
});
