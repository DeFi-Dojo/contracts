import { makeHandler } from "../../handler";
import { quickswapTokenDepositor } from "./quickswap-token-depositor";

export const handler = makeHandler(quickswapTokenDepositor);
