# [DeFi DOJO](https://defidojo.io) Contracts 📑

## Contracts

We describe a few of the core contracts in the DeFi DOJO system. More information can be found in the [contract documentation](docs.md).

- **yNFT Vaults**

  Vaults inherit from the `YNFTVault` contract ([docs](docs/yNFTVaults/YNFTVault.md))
  Currently we have contracts for AAVE and QuickSwap vaults, there are multiple kinds of vaults. Every vault contract instance, has its own yNFT contract instance which works as a key to the vault.

  - [AAVE](https://aave.com/) yNFT Vault ([docs](docs/yNFTVaults/AaveYNFTVault.md)). We have multiple instances deployed ([addresses](consts/deployed/vaults-aave.json)).

    - "Ao" - USDC,

    - "Midori" - USDT,

    - "Kiiro" - DAI

  - [QuickSwap](https://quickswap.exchange/) yNFT Vault ([docs](docs/yNFTVaults/QuickswapYNFTVault.md)). We have multiple instances deployed ([addresses](consts/deployed/vaults-quickswap.json))

    - "Aosaki" - MATIC - USDC,

    - "Hayai" - MATIC - QUICK,

    - "Ahegao" - MATIC - USDT,

    - "Murasaki" - MATIC - ETH

- **yNFT token**  
  yNFT token ([docs](docs/yNFTVaults/YNFT.md)) is used as a key to a given vault. yNFT is created along with the vault.

- **DOJO NFT**  
  This is DeFi Dojo ERC721 token ([docs](docs/nft/DojoNFT.md)).

- **Vesting**  
  The vesting contract is to ensure that the beneficiaries receive funds in accordance with the schedule ([docs](docs/vesting))

## Auto tasks

There are [autotasks](https://docs.openzeppelin.com/defender/autotasks) defined for AAVE and QuickSwap vaults. These are used for auto-staking / auto-compounding in an optimal way to maximize yield.

## Development

### Local environment setup

- Clone repository:
  `git clone git@github.com:DeFi-Dojo/contracts.git`

- Install dependencies:
  `cd contracts && yarn`

- Setup env variables:
  `cp .env.example .env`

- Build contracts and TypeScript code:
  `yarn build`

### Scripts

We use [npm scripts](https://docs.npmjs.com/cli/v8/using-npm/scripts), [hardhat scripts](https://hardhat.org/guides/scripts.html) and [hardhat tasks](https://hardhat.org/guides/create-task.html) in this repository. Some script usage examples below.

- Deploy DOJO NFT and Opensea factory

  ```bash
  yarn deploy:nft:and:opensea:factory
  ```

- Verify Aave Vault on Polygonscan

  ```bash
  npx hardhat --network matic polygonscan-verify-aave --address <vault-address>
    --aaveTokenAddress <underlying-token-address> --ynft-path-uri <ipfs-uri>
  ```

- Verify Quickswap Vault on Polygonscan

  ```bash
  npx hardhat --network matic polygonscan-verify-quickswap --address <vault-address>
    --quickswap-token-pair-address <underlying-pair-address>
   --ynft-path-uri <ipfs-uri>  --quickswap-staking-dual-rewards-address <dual-rewards-address-for-pair>
  ```

- Deploy vesting management

  ```bash
  npx hardhat --network matic deploy-vesting-management
  ```

- Create new terminable vesting

  ```bash
  npx hardhat --network matic create-vesting \
  --vesting-management 0xd37D13Ac196a0D683c9123Ea186B1463C9f929ef \
  --beneficiary 0x0C7f5431e4f233510A3660670B03A1aDD9BeaD45 \
  --start 2022-06-14T09:00 \
  --end 2022-06-14T19:00 \
  --is-terminable true
  ```

- Create new terminable vesting multisig proposal

  ```bash
  npx hardhat --network matic create-vesting-proposal \
  --vesting-management 0x38c90c5f8B64FD867510AbAd844b95C62c7F0e3C \
  --gnosis-safe 0x7dBA423bbB96688c72A45Cc0927FDC41853e2531 \
  --beneficiary 0x1F07c82e914305Bfca5A5B7eC217F2b4BFbb3B35 \
  --start 2022-06-21T20:00 \
  --end 2022-06-23T20:00 \
  --is-terminable true
  ```

- Transfer tokens to vesting
  ```bash
  npx hardhat --network matic transfer \
  --token 0x47b698Efe95FfEaECE9b5b293d777965E48eE652 \
  --amount 10000
  --to 0xD3fE13C31d295a41b62e6521704D14015dde8DBe
  ```

### Code quality

- Contract unit tests: `yarn:test`

- [Solhint](https://protofire.github.io/solhint/) linter: `yarn solhint`

- [Mythril](https://github.com/ConsenSys/mythril) code security analysis: `yarn analyze:mythril`

- Code formatting with [prettier](https://github.com/prettier/prettier): `yarn prettier:solidity`

### Editor settings

**Visual Studio Code**

To enable automatic code prettifying, based on rules defined by solhint, please make sure to have the below directives in your editor settings.

```json
"[solidity]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
},
"editor.formatOnSave": true
```

## Security

TODO: Security audits

## License

TODO: License
