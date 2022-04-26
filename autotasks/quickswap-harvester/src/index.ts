import { makeHandler } from "../../handler";
import { quickswapHarvester } from "./quickswap-harvester";

export const handler = makeHandler(quickswapHarvester);
