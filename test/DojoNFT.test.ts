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

    expect(tokenId).to.equal(1);
    const signers = await ethers.getSigners();
    await dojoNFT.mintTo(signers[0].address);

    const newTokenId = await dojoNFT.public_getNextTokenId();

    expect(newTokenId).to.equal(2);
  });

  it("tokenURI", async () => {
    const TOKEN_ID = 1;
    const tokenURI = await dojoNFT.tokenURI(TOKEN_ID);

    expect(tokenURI).to.equal(`${NFT_BASE_URI}${TOKEN_ID}`);
  });

  it("exist", async () => {
    const TOKEN_ID = 1;
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

    const { faceMask, eyes, horn, weapon, helmet, bust } =
      await dojoNFT.characteristics(0);

    expect({
      faceMask,
      eyes,
      horn,
      weapon,
      helmet,
      bust,
    }).to.deep.equal({
      eyes: 0,
      faceMask: 0,
      helmet: 0,
      horn: 0,
      bust: 0,
      weapon: 0,
    });

    const rarityIndex = await dojoNFT.rarityIndex(1);

    expect(rarityIndex).to.equal(280);
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

  context("_getOption", async () => {
    testGetOption({
      distribution: [40, 25, 20, 10, 4, 1],
      rarity: 0,
      expectedOptionId: 5,
      expectedRarity: 1,
    });

    testGetOption({
      distribution: [40, 25, 20, 10, 4, 1],
      rarity: 1,
      expectedOptionId: 4,
      expectedRarity: 4,
    });

    testGetOption({
      distribution: [40, 25, 20, 10, 4, 1],
      rarity: 99,
      expectedOptionId: 0,
      expectedRarity: 40,
    });

    testGetOption({
      distribution: [40, 25, 20, 10, 4, 1],
      rarity: 99,
      expectedOptionId: 0,
      expectedRarity: 40,
    });

    testGetOption({
      distribution: [40, 25, 20, 10, 4, 1],
      rarity: 50,
      expectedOptionId: 1,
      expectedRarity: 25,
    });

    testGetOption({
      distribution: [40, 25, 20, 10, 4, 1],
      rarity: 30,
      expectedOptionId: 2,
      expectedRarity: 20,
    });

    async function testGetOption({
      distribution,
      rarity,
      expectedOptionId,
      expectedRarity,
    }: {
      distribution: number[];
      rarity: number;
      expectedOptionId: number;
      expectedRarity: number;
    }) {
      it(`gets option for distribution: ${distribution} for rarity: ${rarity}`, async () => {
        const result = await dojoNFT.public_getOption(rarity, distribution);

        expect(result.optionId).to.eq(expectedOptionId);
        expect(result.rarity).to.eq(expectedRarity);
      });
    }
  });
});
