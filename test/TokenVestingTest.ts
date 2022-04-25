import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deployContract} from "../utils/deployment";
import { Contract } from "ethers";
import { DojoToken, TokenVesting } from "../typechain";
import { network } from "hardhat";

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenVesting - basic", function () {
  let accounts: SignerWithAddress[], erc20: Contract, tokenVesting: Contract, ownerAccount: SignerWithAddress, beneficiaryAccount:SignerWithAddress, beneficiary: String;
  const depositAmount = ethers.utils.parseUnits("1000", "ether")
  const vestingAmount = ethers.utils.parseUnits("100", "ether")
  const cliff = 0
  const duration = 1000
  const slicingPeriod = 1

  before(async () => {
    accounts = await ethers.getSigners();
    ownerAccount = accounts[1]
    beneficiaryAccount = accounts[2]
    beneficiary = beneficiaryAccount.address;

    erc20 = await deployContract<DojoToken>(
      "DojoToken",
      [ownerAccount.address],
      undefined
    );

    tokenVesting = await deployContract<TokenVesting>(
      "TokenVesting",
      [erc20.address, ownerAccount.address],
      undefined
    );
  });

  it("Deployment should assign correct token and owner addresses", async function () {
    expect(await tokenVesting.token()).to.equal(erc20.address)
    expect(await tokenVesting.owner()).to.equal(ownerAccount.address)
  });

  it("Vesting contract should receive and register tokens", async function () {
    await erc20.connect(ownerAccount).transfer(tokenVesting.address, depositAmount)
    expect(await tokenVesting.getWithdrawableAmount()).to.equal(depositAmount)
  });

  it("Simple vesting schedule should be created", async function () { 
    const latestBlock = (await ethers.provider.getBlock("latest"))

    await expect(tokenVesting.getVestingSchedule(beneficiary)).to.be.revertedWith("Vesting schedule does not exist")

    await tokenVesting.connect(ownerAccount).createVestingSchedule(beneficiary, latestBlock.timestamp, cliff, duration, slicingPeriod, vestingAmount)

    expect(await tokenVesting.getWithdrawableAmount()).to.equal(depositAmount.sub(vestingAmount))
    expect(await tokenVesting.getVestingSchedulesTotalAmount()).to.equal(vestingAmount)
    
    const createdSchedule = await tokenVesting.getVestingSchedule(beneficiary)
    expect(createdSchedule.initialized)
    expect(createdSchedule.amountTotal).to.equal(vestingAmount)
    expect(createdSchedule.start).to.equal(latestBlock.timestamp)
    expect(createdSchedule.cliff).to.equal(latestBlock.timestamp)
    expect(createdSchedule.duration).to.equal(duration)
    expect(createdSchedule.slicePeriodSeconds).to.equal(slicingPeriod)
    expect(createdSchedule.released).to.equal(0)
  });

  it("Releaseable amounts should be correctly calculated according to elapsed time", async function () { 
    let releaseableAmount = await tokenVesting.computeReleasableAmount(beneficiary);
    expect(releaseableAmount).to.equal(ethers.utils.parseUnits("0.1", "ether")) // 1 second of 1000 passed

    await network.provider.send("evm_increaseTime", [499])
    await network.provider.send("evm_mine")

    releaseableAmount = await tokenVesting.computeReleasableAmount(beneficiary);
    expect(releaseableAmount).to.equal(ethers.utils.parseUnits("50", "ether")) // 500 seconds of 1000 passed
  });

  it("Should not be possible to release amounts greater than the vested amount", async function () { 
    const beneficiary = beneficiaryAccount.address
    let releaseableAmount = await tokenVesting.computeReleasableAmount(beneficiary);
    await expect(tokenVesting.release(beneficiary, releaseableAmount + 1)).to.be.revertedWith("TokenVesting: cannot release tokens, not enough vested tokens")
  }); 

  it("Should be possible to release vested amount", async function () { 
    let releaseableAmount = await tokenVesting.computeReleasableAmount(beneficiary)
    expect(await erc20.balanceOf(beneficiary)).to.equal(0)
    await tokenVesting.release(beneficiary, releaseableAmount)
    expect(await erc20.balanceOf(beneficiary)).to.equal(releaseableAmount)
    
    const vestingSchedule = await tokenVesting.getVestingSchedule(beneficiary)
    expect(vestingSchedule.released).to.equal(releaseableAmount)

    const vestingSchedulesTotalAmount = await tokenVesting.getVestingSchedulesTotalAmount()
    expect(vestingSchedulesTotalAmount).to.equal(vestingAmount.sub(releaseableAmount))

    
    let releaseableAmountAfter = await tokenVesting.computeReleasableAmount(beneficiary)
    expect(releaseableAmountAfter).to.equal(ethers.utils.parseUnits("0.1", "ether")) // 1 second passed after block being mined
  }); 

  it("Should not be possible to create another vesting schedule for an existing contract", async function () { 
    const latestBlock = (await ethers.provider.getBlock("latest"))
    await expect(tokenVesting.connect(ownerAccount).createVestingSchedule(beneficiary, latestBlock.timestamp, cliff, duration, slicingPeriod, vestingAmount)).to.be.revertedWith("Vesting schedule already exists")
  });

  it("Should not be possible to create vesting schedule from address other than owner", async function () { 
    const latestBlock = (await ethers.provider.getBlock("latest"))
    await expect(tokenVesting.connect(accounts[2]).createVestingSchedule(beneficiary, latestBlock.timestamp, cliff, duration, slicingPeriod, vestingAmount)).to.be.revertedWith("Ownable: caller is not the owner")
  });

  it("Should not be possible to create vesting schedule with amount exceeding the contract balance", async function () { 
    const contractBalance = await erc20.balanceOf(tokenVesting.address)
    let vestingAmount = contractBalance + 1
    let beneficiary = accounts[3].address
    const latestBlock = (await ethers.provider.getBlock("latest"))
    await expect(tokenVesting.connect(ownerAccount).createVestingSchedule(beneficiary, latestBlock.timestamp, cliff, duration, slicingPeriod, vestingAmount)).to.be.revertedWith("TokenVesting: not enough tokens to create a vesting schedule")
  });

  it("Should be possible to release full vested amount after duration elapsed", async function () { 
    await network.provider.send("evm_increaseTime", [2000])
    await network.provider.send("evm_mine")

    let releaseableAmount = await tokenVesting.computeReleasableAmount(beneficiary)
    await tokenVesting.release(beneficiary, releaseableAmount)
    expect(await erc20.balanceOf(beneficiary)).to.equal(vestingAmount)
    await expect(tokenVesting.getVestingSchedule(beneficiary)).to.be.revertedWith("Vesting schedule does not exist")
    const vestingSchedulesTotalAmount = await tokenVesting.getVestingSchedulesTotalAmount()
    expect(vestingSchedulesTotalAmount).to.equal(0)
  });

  it("Should not be possible to withdraw tokens from non-owner address", async function () { 
    let withdrawableAmount = await tokenVesting.getWithdrawableAmount()
    await expect(tokenVesting.connect(beneficiaryAccount).withdraw(withdrawableAmount)).to.be.revertedWith("Ownable: caller is not the owner")
  });

  it("Should be possible to withdraw remaining tokens", async function () { 
    let withdrawableAmount = await tokenVesting.getWithdrawableAmount()
    let balanceBeforeWithdrawal = await erc20.balanceOf(ownerAccount.address)
    expect(withdrawableAmount).to.equal(depositAmount.sub(vestingAmount))
    await tokenVesting.connect(ownerAccount).withdraw(withdrawableAmount)
    let balanceAfterWithdrawal = await erc20.balanceOf(ownerAccount.address)
    
    expect(await tokenVesting.getWithdrawableAmount()).to.equal(0)
    expect(balanceAfterWithdrawal.sub(balanceBeforeWithdrawal)).to.equal(depositAmount.sub(vestingAmount))
  });
});

describe("TokenVesting - cliff, slicing & early release", function () {
  let accounts: SignerWithAddress[], erc20: Contract, tokenVesting: Contract, ownerAccount: SignerWithAddress, beneficiaryAccount:SignerWithAddress, beneficiary: String;
  const depositAmount = ethers.utils.parseUnits("1000", "ether")
  const vestingAmount = ethers.utils.parseUnits("100", "ether")
  const cliff = 2000
  const duration = 10000
  const slicingPeriod = 1000
  
  before(async () => {
    accounts = await ethers.getSigners();
    ownerAccount = accounts[1]
    beneficiaryAccount = accounts[3]
    beneficiary = beneficiaryAccount.address;

    erc20 = await deployContract<DojoToken>(
      "DojoToken",
      [ownerAccount.address],
      undefined
    );

    tokenVesting = await deployContract<TokenVesting>(
      "TokenVesting",
      [erc20.address, ownerAccount.address],
      undefined
    );
  });

  it("Create a vesting schedule", async function () {
    await erc20.connect(ownerAccount).transfer(tokenVesting.address, depositAmount)
    expect(await tokenVesting.getWithdrawableAmount()).to.equal(depositAmount)
    const latestBlock = (await ethers.provider.getBlock("latest"))
    await tokenVesting.connect(ownerAccount).createVestingSchedule(beneficiary, latestBlock.timestamp, cliff, duration, slicingPeriod, vestingAmount)

    expect(await tokenVesting.getWithdrawableAmount()).to.equal(depositAmount.sub(vestingAmount))
    expect(await tokenVesting.getVestingSchedulesTotalAmount()).to.equal(vestingAmount)
       
    const createdSchedule = await tokenVesting.getVestingSchedule(beneficiary)
    expect(createdSchedule.initialized)
    expect(createdSchedule.amountTotal).to.equal(vestingAmount)
    expect(createdSchedule.start).to.equal(latestBlock.timestamp)
    expect(createdSchedule.cliff).to.equal(latestBlock.timestamp + cliff)
    expect(createdSchedule.duration).to.equal(duration)
    expect(createdSchedule.slicePeriodSeconds).to.equal(slicingPeriod)
    expect(createdSchedule.released).to.equal(0)
  });


  it("Should not increase releaseable amount before cliff passes", async function () { 
    let releaseableAmount = await tokenVesting.computeReleasableAmount(beneficiary);
    expect(releaseableAmount).to.equal(0)
    await network.provider.send("evm_increaseTime", [cliff - 10])
    await network.provider.send("evm_mine")
    releaseableAmount = await tokenVesting.computeReleasableAmount(beneficiary)
    expect(releaseableAmount).to.equal(0)
  });

  it("Should increase releaseable amount after cliff passes", async function () { 
    await network.provider.send("evm_increaseTime", [slicingPeriod])
    await network.provider.send("evm_mine")
    const releaseableAmount = await tokenVesting.computeReleasableAmount(beneficiary)
    expect(releaseableAmount).to.equal(vestingAmount.mul(cliff).div(duration))
  });

  it("Should increase releaseable amount after slice passes", async function () { 
    await network.provider.send("evm_increaseTime", [slicingPeriod / 2])
    await network.provider.send("evm_mine")
    const releaseableAmount = await tokenVesting.computeReleasableAmount(beneficiary)
    expect(releaseableAmount).to.equal(vestingAmount.mul(cliff + slicingPeriod).div(duration))
  });
});