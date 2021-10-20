import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContract, waitForReceipt } from "../utils/deployment";
import { ExposedDojoNFT } from "../typechain";
import { PROXY_REGISTRY_ADDRESS_RINKEBY } from "../consts";

describe("DojoNFT", () => {
  let dojoNFT: Contract;

  const NFT_BASE_URI = "https://creatures-api.opensea.io/api/creature/";
  const BLOCK_TIMESTAMP = 1634550719723;
  const BLOCK_DIFFUCLTY = 100000000;

  beforeEach(async () => {
    dojoNFT = await deployContract<ExposedDojoNFT>(
      "ExposedDojoNFT",
      [NFT_BASE_URI, PROXY_REGISTRY_ADDRESS_RINKEBY],
      undefined,
      false
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

  it("_mintTo", async () => {
    const [owner] = await ethers.getSigners();

    await dojoNFT
      .public_mintTo(owner.address, BLOCK_TIMESTAMP, BLOCK_DIFFUCLTY)
      .then(waitForReceipt);

    const balance = await dojoNFT.balanceOf(owner.address);

    expect(balance._hex).to.equal("0x01");

    const {
      faceMask,
      eyes,
      symbol,
      horn,
      weapon,
      helmetMaterial,
      faceMaskColor,
      faceMaskPattern,
      samuraiSex,
    } = await dojoNFT.characteristics(0);

    expect({
      faceMask,
      eyes,
      symbol,
      horn,
      weapon,
      helmetMaterial,
      faceMaskColor,
      faceMaskPattern,
      samuraiSex,
    }).to.deep.equal({
      eyes: 0,
      faceMask: 3,
      faceMaskColor: 2,
      faceMaskPattern: 0,
      helmetMaterial: 0,
      horn: 0,
      samuraiSex: 0,
      symbol: 2,
      weapon: 1,
    });
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

    expect(await dojoNFT.public_getOption(99, DISTRIBUTION)).to.equal(4);

    expect(await dojoNFT.public_getOption(0, DISTRIBUTION)).to.equal(0);

    expect(await dojoNFT.public_getOption(50, DISTRIBUTION)).to.equal(1);

    expect(await dojoNFT.public_getOption(70, DISTRIBUTION)).to.equal(2);
  });
});
