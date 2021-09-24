
const { bytecode } = require('./artifacts/contracts/sushiswap/uniswapv2/UniswapV2Pair.sol/UniswapV2Pair.json');
const { keccak256 } = require('@ethersproject/solidity');
const COMPUTED_INIT_CODE_HASH = keccak256(['bytes'], [bytecode]);

console.log('COMPUTED_INIT_CODE_HASH', COMPUTED_INIT_CODE_HASH);