import { makeHandler } from "../../handler";
import { aaveHarvester } from "../aave-harvester";

export const handler = makeHandler(aaveHarvester);
