/* eslint-disable no-underscore-dangle */
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContract, waitForReceipt } from "../utils/deployment";
import { ExposedDojoNFT, ProxyRegistry } from "../typechain";

describe("DojoNFT", () => {
  let dojoNFT: Contract;
  let proxyRegistry: Contract;

  const NFT_BASE_URI = "https://creatures-api.opensea.io/api/creature/";
  const BLOCK_TIMESTAMP = 1634550719723;
  const BLOCK_DIFFUCLTY = 100000000;

  beforeEach(async () => {
    proxyRegistry = await deployContract<ProxyRegistry>(
        "ProxyRegistry",
        [],
        undefined
    );

    dojoNFT = await deployContract<ExposedDojoNFT>(
      "ExposedDojoNFT",
      [NFT_BASE_URI, proxyRegistry.address],
      undefined
    );
  });

  it("setBaseTokenURI", async () => {
    const NEW_NFT_BASE_URI = "https://new-api.opensea.io/api/creature/";

    await dojoNFT.setBaseTokenURI(NEW_NFT_BASE_URI).then(waitForReceipt);

    const baseTokenURI = await dojoNFT.baseTokenURI();

    expect(baseTokenURI).to.equal(NEW_NFT_BASE_URI);
  });

  it("_getNextTokenId & _incrementTokenId", async () => {
    const tokenId = await dojoNFT.public_getNextTokenId();

    expect(tokenId).to.equal(0);

    await dojoNFT.public_incrementTokenId();

    const newTokenId = await dojoNFT.public_getNextTokenId();

    expect(newTokenId).to.equal(1);
  });

  it("tokenURI", async () => {
    const TOKEN_ID = 1;
    const tokenURI = await dojoNFT.tokenURI(TOKEN_ID);

    expect(tokenURI).to.equal(`${NFT_BASE_URI}${TOKEN_ID}`);
  });

  it("exist", async () => {
    const TOKEN_ID = 0;
    const [owner] = await ethers.getSigners();

    expect(await dojoNFT.exist(TOKEN_ID)).to.equal(false);

    await dojoNFT
      .public_mintTo(owner.address, BLOCK_TIMESTAMP, BLOCK_DIFFUCLTY)
      .then(waitForReceipt);

    expect(await dojoNFT.exist(TOKEN_ID)).to.equal(true);
  });

  it("_mintTo", async () => {
    const [owner] = await ethers.getSigners();

    await dojoNFT
      .public_mintTo(owner.address, BLOCK_TIMESTAMP, BLOCK_DIFFUCLTY)
      .then(waitForReceipt);

    const balance = await dojoNFT.balanceOf(owner.address);

    expect(balance._hex).to.equal("0x01");

    const { faceMask, eyes, symbol, horn, weapon, helmet, bust } =
      await dojoNFT.characteristics(0);

    expect({
      faceMask,
      eyes,
      symbol,
      horn,
      weapon,
      helmet,
      bust,
    }).to.deep.equal({
      eyes: 0,
      faceMask: 3,
      helmet: 0,
      horn: 0,
      bust: 2,
      symbol: 2,
      weapon: 1,
    });

    const rarityIndex = await dojoNFT.rarityIndex(0);

    expect(rarityIndex).to.equal(170);
  });

  it("_randPercentage", async () => {
    const TOKEN_ID = 1;
    const result = await dojoNFT.public_randPercentage(
      TOKEN_ID,
      "TEST_PREFIX",
      BLOCK_TIMESTAMP,
      BLOCK_DIFFUCLTY
    );

    expect(result).to.equal(57);
  });

  it("_getOption", async () => {
    const DISTRIBUTION = [50, 60, 85, 95, 100];

    const { optionId: optionId1, rarity: rarity1 } =
      await dojoNFT.public_getOption(99, DISTRIBUTION);

    expect({ optionId: optionId1, rarity: rarity1._hex }).to.deep.equal({
      optionId: 4,
      rarity: "0x05",
    });

    const { optionId: optionId2, rarity: rarity2 } =
      await dojoNFT.public_getOption(0, DISTRIBUTION);

    expect({ optionId: optionId2, rarity: rarity2._hex }).to.deep.equal({
      optionId: 0,
      rarity: "0x32",
    });

    const { optionId: optionId3, rarity: rarity3 } =
      await dojoNFT.public_getOption(50, DISTRIBUTION);

    expect({ optionId: optionId3, rarity: rarity3._hex }).to.deep.equal({
      optionId: 1,
      rarity: "0x0a",
    });

    const { optionId: optionId4, rarity: rarity4 } =
      await dojoNFT.public_getOption(70, DISTRIBUTION);

    expect({ optionId: optionId4, rarity: rarity4._hex }).to.deep.equal({
      optionId: 2,
      rarity: "0x19",
    });
  });
});
