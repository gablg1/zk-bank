const assert = require('assert');
const { expect } = require("chai");
const { time } = require("@openzeppelin/test-helpers");
const { ethers } = require("hardhat");


describe("Bank", () => {
  let bank, accounts, signers;

  before(async () => {
    // Deploy contracts
    const bankFactory = await ethers.getContractFactory('Bank');
    const creditScorerFactory = await ethers.getContractFactory('CreditScorer');

    signers = await ethers.getSigners();
    accounts = signers.map(s => s.address);

    const scorer = await creditScorerFactory.deploy();
    bank = await bankFactory.deploy("zkBank", "lToken", scorer.address);
    assert.notEqual(bank, undefined, "Bank contract instance is undefined.");

    expect(await bank.totalSupply()).to.equal(0);
  });

  it("TODO", async () => {
    expect(1).to.equal(1);
  });

});
