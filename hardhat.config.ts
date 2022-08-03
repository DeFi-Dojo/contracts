import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-etherscan";
import "@primitivefi/hardhat-dodoc";
import "solidity-coverage";

import { task, HardhatUserConfig } from "hardhat/config";
import configEnv from "./config";
import { createVesting } from "./utils/deployment/vesting";
import { createAddNewVestingProposal } from "./utils/defender/create-vesting-proposal";

const {
  RINKEBY_API_URL,
  DEFAULT_NETWORK,
  POLYGON_MUMBAI_API_URL,
  WALLET_MNEMONIC,
  KOVAN_API_URL,
  POLYGON_MAINNET_API_URL,
  HARDHAT_FORKING_URL,
  HARVESTER_ADDRESS,
  BENEFICIARY_ADDRESS,
  MORALIS_IPFS_URL,
  ADDRESSES,
  ETHERSCAN_API_KEY,
} = configEnv;

// Vesting
task("deploy-vesting-management")
  .addOptionalParam("owner", "new vesting owner")
  .setAction(async (taskArgs, { ethers }) => {
    const owner: string | undefined = taskArgs?.owner;
    const signers = await ethers.getSigners();
    const contractName = "VestingManagement";
    const contractFactory = await ethers.getContractFactory(contractName);

    console.log(`Deploying ${contractName}`);
    const contract = await contractFactory.deploy();
    await contract.deployed();
    console.log(`${contractName} deployed to: `, contract.address);

    if (owner && owner.toLowerCase() !== signers[0].address) {
      await contract.transferOwnership(owner);
    }
  });

task("deploy-djo-token")
  .addOptionalParam<string>("mintTarget", "Mint target address")
  .setAction(async (taskArgs, { ethers }) => {
    const signers = await ethers.getSigners();
    const contractName = "DojoToken";
    const contractFactory = await ethers.getContractFactory(contractName);
    const mintTargetAddress = taskArgs.mintTarget || signers[0].address;

    console.log(`Deploying ${contractName}`);
    const contract = await contractFactory.deploy(mintTargetAddress);
    await contract.deployed();
    console.log(`${contractName} deployed to: `, contract.address);
  });

task("create-vesting")
  .addParam<string>("vestingManagement", "Vesting management contract address")
  .addParam<string>("beneficiary", "Vesting beneficiary address")
  .addParam<string>("start", "Vesting start ISO date")
  .addParam<string>("end", "Vesting end ISO date")
  .addOptionalParam<string>("isTerminable", "Is vesting terminable (not fixed)")
  .setAction(async (taskArgs, { ethers }) => {
    const start = Date.parse(taskArgs.start) / 1000;
    const end = Date.parse(taskArgs.end) / 1000;
    const isTerminable = taskArgs.isTerminable === "true";
    const { beneficiary, vestingManagement } = taskArgs;

    await createVesting(
      { start, end, isTerminable, beneficiary, vestingManagement },
      { ethers }
    );
  });

task("create-vesting-proposal")
  .addParam<string>("vestingManagement", "Vesting management contract address")
  .addParam<string>("gnosisSafe", "Gnosis safe contract address")
  .addParam<string>("beneficiary", "Vesting beneficiary address")
  .addParam<string>("start", "Vesting start ISO date")
  .addParam<string>("end", "Vesting end ISO date")
  .addOptionalParam<string>("isTerminable", "Is vesting terminable (not fixed)")
  .setAction(async (taskArgs) => {
    const isTerminable = taskArgs.isTerminable === "true";
    const { beneficiary, vestingManagement, start, end, gnosisSafe } = taskArgs;

    await createAddNewVestingProposal({
      start,
      end,
      isTerminable,
      beneficiary,
      vestingManagement,
      gnosisSafe,
    });
  });

task("transfer", "Transfers ERC-20 tokens")
  .addParam("token", "Token address")
  .addParam("amount", "Token amount")
  .addParam("to", "Receiver address")
  .setAction(async (taskArgs, { ethers }) => {
    const bn = ethers.BigNumber.from;
    const { token, amount, to } = taskArgs;

    const DojoTokenFactory = await ethers.getContractFactory("DojoToken");
    const dojoToken = DojoTokenFactory.attach(token);

    console.log(`Sending ${amount} tokens to last vesting at ${to}`);
    await dojoToken.transfer(to, bn(amount).mul(bn(10).pow(18)));
  });

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  accounts.forEach((account) => console.log(account.address));
});

task(
  "polygonscan-verify-aave",
  "Verifies contract of given address on polygonscan"
)
  .addParam("address", "contract address")
  .addParam("aaveTokenAddress", "address of aToken")
  .addParam("ynftPathUri", "uri path for ynft data")
  .setAction(async (taskArgs, hre) => {
    await hre.run("verify:verify", {
      address: taskArgs.address,
      constructorArguments: [
        ADDRESSES.ROUTER_02_QUICKSWAP,
        taskArgs.aaveTokenAddress, // A_DAI, A_USDT, A_USDC
        ADDRESSES.INCENTIVES_CONTROLLER,
        HARVESTER_ADDRESS,
        BENEFICIARY_ADDRESS,
        "Dojo yNFT",
        MORALIS_IPFS_URL,
        taskArgs.ynftPathUri,
      ],
    });
  });

task(
  "polygonscan-verify-quickswap",
  "Verifies contract of given address on polygonscan"
)
  .addParam("address", "contract address")
  .addParam("quickswapTokenPairAddress", "address of quickswap pair")
  .addParam(
    "quickswapStakingDualRewardsAddress",
    "address of quickswap staking dual rewards contract"
  )
  .addParam("ynftPathUri", "uri path for ynft data")
  .setAction(async (taskArgs, hre) => {
    await hre.run("verify:verify", {
      address: taskArgs.address,
      constructorArguments: [
        ADDRESSES.ROUTER_02_QUICKSWAP,
        taskArgs.quickswapTokenPairAddress,
        taskArgs.quickswapStakingDualRewardsAddress,
        ADDRESSES.DQUICK,
        ADDRESSES.WMATIC,
        HARVESTER_ADDRESS,
        BENEFICIARY_ADDRESS,
        "Dojo yNFT",
        MORALIS_IPFS_URL,
        taskArgs.ynftPathUri,
      ],
    });
  });

const accounts = {
  mnemonic: WALLET_MNEMONIC,
};

const config: HardhatUserConfig = {
  dodoc: {
    include: ["contracts"],
    exclude: [
      "dummyVaults",
      "elin",
      "interfaces",
      "test",
      "console",
      "utils",
      "OwnableDelegateProxy",
    ],
    freshOutput: true,
  },
  defaultNetwork: DEFAULT_NETWORK,
  networks: {
    hardhat: {
      chainId: 1337,
      // minting on the DojoNFT takes about 325354 gas
      gas: 400000,
      forking: {
        url: HARDHAT_FORKING_URL,
      },
      mining: {
        auto: false,
        interval: 5000,
      },
      accounts,
    },
    kovan: {
      url: KOVAN_API_URL,
      accounts,
    },
    rinkeby: {
      url: RINKEBY_API_URL,
      accounts,
    },
    matic: {
      url: POLYGON_MAINNET_API_URL,
      accounts,
      gasPrice: 44000000000, // 44 gwei
      gasMultiplier: 1.2,
    },
    mumbai: {
      url: POLYGON_MUMBAI_API_URL,
      accounts,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.5.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.5.5",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
    settings: {
      outputSelection: {
        "*": {
          "*": ["storageLayout"],
        },
      },
    },
  },

  paths: {
    sources: "./contracts",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    parallel: false,
    timeout: 20000,
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;
