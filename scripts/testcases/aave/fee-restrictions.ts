import { expect } from "chai";
import { ContractFunction } from "@ethersproject/contracts";
import { createDeployContract } from "../../../utils/deployment";
import { AaveYNFTVault__factory } from "../../../typechain";
import configEnv from "../../../config";
import { uploadYnftMetadata } from "../../../utils";
import { AaveVaultName } from "../../../consts";
// eslint-disable-next-line import/no-extraneous-dependencies

const { ADDRESSES, HARVESTER_ADDRESS, BENEFICIARY_ADDRESS, MORALIS_IPFS_URL } =
  configEnv;

async function expectException(
  promise: Promise<ContractFunction>,
  expectedError: string
) {
  try {
    await promise;
  } catch (error: any) {
    if (error.message.indexOf(expectedError) === -1) {
      // When the exception was a revert, the resulting string will include only
      // the revert reason, otherwise it will be the type of exception (e.g. 'invalid opcode')
      const actualError = error.message.replace(
        /Returned error: VM Exception while processing transaction: (revert )?/,
        ""
      );
      expect(actualError).to.equal(
        expectedError,
        "Wrong kind of exception received"
      );
    }
    return;
  }
  expect.fail("Expected an exception but none was received");
}

async function main() {
  const deploy = createDeployContract<AaveYNFTVault__factory>("AaveYNFTVault");
  const ynftPathUri = await uploadYnftMetadata(AaveVaultName.usdt);
  const yNFTVault = await deploy(
    ADDRESSES.ROUTER_02_SUSHISWAP,
    ADDRESSES.A_USDT, // A_DAI, A_USDT, A_USDC
    ADDRESSES.INCENTIVES_CONTROLLER,
    HARVESTER_ADDRESS,
    BENEFICIARY_ADDRESS,
    "Dojo yNFT",
    MORALIS_IPFS_URL,
    ynftPathUri
  );

  await expectException(yNFTVault.setFee(101), "Fee cannot be that much");
  await expectException(
    yNFTVault.setPerformanceFee(201),
    "Performance Fee cannot be that much"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
