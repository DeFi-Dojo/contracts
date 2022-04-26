/* eslint-disable no-underscore-dangle */
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContract, waitForReceipt } from "../utils/deployment";
import { DojoToken } from "../typechain";

describe("DojoToken", () => {
  let dojoToken: Contract;

  beforeEach(async () => {
  const [signer] = await ethers.getSigners();
    dojoToken = await deployContract<DojoToken>(
      "DojoToken",
      [signer.address],
      undefined
    );
  });

  it('should have $DOJO Token name and 18 decimals precision', async () => {
    expect(await dojoToken.name()).to.equal("$DOJO Token");
    expect(await dojoToken.symbol()).to.equal("DOJO");
    expect(await dojoToken.decimals()).to.equal(18);
  });

  it('should have 400000000 coins as initial amount', async () => {
    const [signer] = await ethers.getSigners();
    expect(await dojoToken.balanceOf(signer.address)).to.equal(ethers.utils.parseUnits("400000000", "ether"));
  });

});
