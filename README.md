# [DeFi DOJO](https://defidojo.io) Contracts 📑

## Contracts

We describe a few of the core contracts in the DeFi DOJO system. More information can be found in the [contract documentation](docs/).

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
