# LP <-> NFT Contracts

A hybrid LPNFT contract acts as a vault, in which an NFT token gives access to assets expressed in form of ERC20 tokens. For now two kinds of assets are supported: aTokens, issued by the Aave protocol and Sushi LP tokens (SLP in short), issued by the Sushi protocol.

The LPNFT contract internally holds two addresses:

- of a certain ERC721 contract
- of a certain ERC20 contract.

Because of that there is a one-to-one relationship between these two tokens inside a single LPNFT contract.

Also, notice that each pair of tokens on Sushi gives rise to a different SLP. The same way some lending pool in the Aave protocol issues its own aToken. A single LPNFT contract only knows how to operate on that one particular ERC20 token.

To illustrate this, think of ETH-DAI pair on Sushiswap. This pair issues its own LP tokens that represent the right to withdraw a certain amount of liquidity from that pool. Also, it is implicitly assumed that the value of these LP tokens increases with time, as the fees from swaps go to the liquidity pool itself. That ETH-DAI LP token will be joined together with some ERC721 contract to create our LPNFT contract. Tokens from the ERC721 contract will give access to the ETH-DAI SLP. The same goes for any other pair on Sushiswap, it will create a separate LPNFT contract.

## Inside the LPNFT contract

Inside the LPNFT contract you can also find a `mapping` that assigns a particular NFT's `id` to some balance of the ERC20 token. The amount of ERC20 tokens that one NFT holds can be increased or decreased with the functions exposed by the LPNFT contract:

- `addLPtoNFT` function increases the amount of ERC20 tokens assigned to a specific NFT `id`. As arguments, this function expects the NFT's `id` to add funds to and the amount of ERC20 tokens that the user approved to put in this vault. Note that this function requires the user to already posses some SLP/aTokens. In future, we might want to change this function so that the user provides some regular tokens that we ourselves will transform to SLP/aTokens.
- `redeemLPTokens` function decreases the amount of ERC20 tokens assigned to the NFT's `id`. As arguments, this function expects a specific NFT's `id` and the amount of SLP/aTokens to withdraw. This operation will also burn that amount of SLP/aTokens and the user will be given the equivalent of their value expressed in what these tokens represented, i.e. ETH in case of aTokens or ETH _and_ DAI in case of SLP.

When the user calls the function `addLPtoNFT`, the LPNFT contract calls the `safeTransferFrom` function of the appropriate token to transfer these tokens to the chosen `tokenId` of the related NFT, therefore whoever owns the NFT with that `tokenId` owns the tokens in the smart contract. Similarly, when redeeming, the contract first burns an appropriate amount of tokens (in case of Sushi we use its router's `removeLiquidity` function and in case of Aave we use aToken's `redeem` function) and then the LPNFT contract calls `safeTransfer` functions of these claimed tokens to transfer the entirety of the recovered liquidity back to the user.

# Deploy nft and opensea factory

1. Run in the terminal:

```bash
$ yarn run:node
```

2. Open second terminal and run:

```bash
$ yarn deploy:nft:and:opensea:factory
```

# Other
Run tests
```
yarn test
```

Run solhint
```
yarn solhint
```