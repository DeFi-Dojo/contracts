import { makeHandler } from "../../handler";
import { quickswapRewardsGetter } from "./quickswap-harvester";

export const handler = makeHandler(quickswapRewardsGetter);
