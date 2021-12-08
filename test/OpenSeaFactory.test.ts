/* eslint-disable no-underscore-dangle */
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContract, waitForReceipt } from "../utils/deployment";
import { OpenSeaFactory, DojoNFT, MockProxyRegistry } from "../typechain";
import { PROXY_REGISTRY_ADDRESS_RINKEBY } from "../consts";

describe("DojoNFT", () => {
  let dojoNFT: Contract;
  let openSeaFactory: Contract;
  let mockProxyRegistry: Contract;

  const NFT_BASE_URI = "https://creatures-api.opensea.io/api/creature/";
  const NFT_MAX_SUPPLY = 2;

  const FACTORY_BASE_URI = "https://creatures-api.opensea.io/api/factory/";

  beforeEach(async () => {
    dojoNFT = await deployContract<DojoNFT>(
      "DojoNFT",
      [NFT_BASE_URI, PROXY_REGISTRY_ADDRESS_RINKEBY],
      undefined
    );

    mockProxyRegistry = await deployContract<MockProxyRegistry>(
      "MockProxyRegistry",
      [],
      undefined
    );

    openSeaFactory = await deployContract<OpenSeaFactory>(
      "OpenSeaFactory",
      [mockProxyRegistry.address, dojoNFT.address, NFT_MAX_SUPPLY],
      undefined
    );
  });

  it("numOptions", async () => {
    const numOptions = await openSeaFactory.numOptions();

    expect(numOptions).to.equal(1);
  });

  it("tokenURI", async () => {
    const OPTION_ID = 0;

    const tokenURI = await openSeaFactory.tokenURI(OPTION_ID);

    expect(tokenURI).to.equal(`${FACTORY_BASE_URI}${OPTION_ID}`);
  });

  it("canMint", async () => {
    expect(await openSeaFactory.canMint(0)).to.equal(true);

    expect(await openSeaFactory.canMint(1)).to.equal(false);
  });

  it("mint", async () => {
    const [owner] = await ethers.getSigners();

    await dojoNFT
      .transferOwnership(openSeaFactory.address)
      .then(waitForReceipt);

    const OPTION_ID = 0;

    await openSeaFactory.mint(OPTION_ID, owner.address).then(waitForReceipt);

    await openSeaFactory.mint(OPTION_ID, owner.address).then(waitForReceipt);

    try {
      await openSeaFactory.mint(OPTION_ID, owner.address).then(waitForReceipt);
      // eslint-disable-next-line no-empty
    } catch (_) {}

    const balance = await dojoNFT.balanceOf(owner.address);

    expect(balance._hex).to.equal("0x02");
  });
});
