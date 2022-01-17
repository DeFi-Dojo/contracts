/* eslint-disable no-underscore-dangle */
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContract, waitForReceipt } from "../utils/deployment";
import { YNFT } from "../typechain";

// @ts-ignore
import { expectRevert } from "@openzeppelin/test-helpers";

describe("YNFTVault", () => {
  let ynft: Contract;

  beforeEach(async () => {
    ynft = await deployContract<YNFT>(
      "YNFT",
      [],
      undefined
    );
  });

  it('should have Dojo yNFT name and yNFT symbol', async () => {
    expect(await ynft.name()).to.equal("Dojo yNFT");
    expect(await ynft.symbol()).to.equal("yNFT");
  });

  it('should not mint if not owner', async () => {
      const signers = await ethers.getSigners();
      await expectRevert(ynft.connect(signers[1]).mint(signers[2].address), "Ownable: caller is not the owner");
  });

  it('should not reuse ids', async () => {
      const signers = await ethers.getSigners();
      await ynft.mint(signers[2].address);
      expect(await ynft.ownerOf(0)).to.equal(signers[2].address);
      await ynft.burn(0);
      await expectRevert(ynft.ownerOf(0), "ERC721: owner query for nonexistent token");
      await ynft.mint(signers[2].address);
      expect(await ynft.ownerOf(1)).to.equal(signers[2].address);
  });

});
