import { makeHandler } from "../../handler";
import { quickswapRewardsGetter } from "./quickswap-rewards-getter";

export const handler = makeHandler(quickswapRewardsGetter);
