/* eslint-disable no-underscore-dangle */
import { expect } from "chai";
import { ethers } from "hardhat";
// @ts-ignore
import { expectRevert } from "@openzeppelin/test-helpers";
import { deployContract } from "../utils/deployment";
import { YNFT } from "../typechain";

describe("YNFTVault", () => {
  let ynft: YNFT;

  beforeEach(async () => {
    ynft = await deployContract<YNFT>(
      "YNFT",
      ["Dojo yNFT", "yNFT", "base.uri/", "path"],
      undefined
    );
  });

  it("should have Dojo yNFT name and yNFT symbol", async () => {
    expect(await ynft.name()).to.equal("Dojo yNFT");
    expect(await ynft.symbol()).to.equal("yNFT");
    expect(await ynft["tokenURI()"]()).to.equal("base.uri/path");
    expect(await ynft["tokenURI(uint256)"](0)).to.equal("base.uri/path");
  });

  it("should not mint if not owner", async () => {
    const signers = await ethers.getSigners();
    await expectRevert(
      ynft.connect(signers[1]).mint(signers[2].address),
      "Ownable: caller is not the owner"
    );
  });

  it("should set base url and path", async () => {
    await ynft.setBaseURI("new.uri/");
    await ynft.setPathURI("new-path");
    expect(await ynft["tokenURI()"]()).to.equal("new.uri/new-path");
  });

  it("should not set base url if not owner", async () => {
    const signers = await ethers.getSigners();
    await expectRevert(
      ynft.connect(signers[1]).setBaseURI("new.uri"),
      "Ownable: caller is not the owner"
    );
  });

  it("should not set path url if not owner", async () => {
    const signers = await ethers.getSigners();
    await expectRevert(
      ynft.connect(signers[1]).setPathURI("new-path"),
      "Ownable: caller is not the owner"
    );
  });

  it("should not reuse ids", async () => {
    const signers = await ethers.getSigners();
    await ynft.mint(signers[2].address);
    expect(await ynft.ownerOf(0)).to.equal(signers[2].address);
    await ynft.burn(0);
    await expectRevert(
      ynft.ownerOf(0),
      "ERC721: owner query for nonexistent token"
    );
    await ynft.mint(signers[2].address);
    expect(await ynft.ownerOf(1)).to.equal(signers[2].address);
  });
});
