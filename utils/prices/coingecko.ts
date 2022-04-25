import axios from "axios";

const baseURL = "https://api.coingecko.com/api/v3/";

export const coingeckoApi = axios.create({
  baseURL,
});

export const getTokenPriceUSD = async (
  tokenAddress: string
): Promise<number | void> => {
  const url = `simple/token_price/polygon-pos?contract_addresses=${tokenAddress}&vs_currencies=USD`;
  type GetResult = { [address: string]: { usd: number } };

  try {
    const { data } = await coingeckoApi.get<GetResult>(url);
    const priceUSD = data[tokenAddress.toLowerCase()]?.usd;

    return priceUSD;
  } catch (e) {
    return console.error("Could not get token price", e);
  }
};

export const getTokenPricesUSD = async (tokenAddresses: [string, string]) =>
  Promise.all(tokenAddresses.map(getTokenPriceUSD)) as Promise<
    [number | void, number | void]
  >;
