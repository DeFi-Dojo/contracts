import axios from "axios";

const baseURL = "https://api.coingecko.com/api/v3/";

export const coingeckoApi = axios.create({
  baseURL,
});

export const getTokenPriceUsd = async (
  tokenAddress: string
): Promise<number> => {
  const url = `simple/token_price/polygon-pos?contract_addresses=${tokenAddress}&vs_currencies=USD`;
  type GetResult = { [address: string]: { usd: number } };

  try {
    const { data } = await coingeckoApi.get<GetResult>(url);
    const priceUSD = data[tokenAddress.toLowerCase()]?.usd;

    return priceUSD;
  } catch (e) {
    console.log(e);
    throw new Error("Could not get token price");
  }
};

export const getTokenPricesUsd = async (tokenAddresses: [string, string]) =>
  Promise.all(tokenAddresses.map(getTokenPriceUsd)) as Promise<
    [number, number]
  >;
