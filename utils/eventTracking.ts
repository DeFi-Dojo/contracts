import Web3Type from "web3/types";
import { Log } from "web3-core/types";

// https://docs.matic.network/docs/develop/ethereum-matic/pos/deposit-withdraw-event-pos/#checkpoint-events
// txHash - transaction hash on Matic
// rootChainAddress - root chain proxy address on Ethereum
export async function checkInclusion({
  txHash,
  rootChainAddress,
  childWeb3,
  parentWebsocketWeb3,
}: {
  txHash: string;
  rootChainAddress: string;
  childWeb3: Web3Type;
  parentWebsocketWeb3: Web3Type;
}): Promise<Log> {
  let txDetails = await childWeb3.eth.getTransactionReceipt(txHash);

  const block = txDetails.blockNumber;
  return new Promise((resolve, reject) => {
    parentWebsocketWeb3.eth.subscribe(
      "logs",
      {
        address: rootChainAddress,
      },
      (error, result) => {
        if (error) {
          reject(error);
        }

        if (result.data) {
          let transaction = parentWebsocketWeb3.eth.abi.decodeParameters(
            ["uint256", "uint256", "bytes32"],
            result.data
          );
          if (block <= transaction["1"]) {
            resolve(result);
          }
        }
      }
    );
  });
}
