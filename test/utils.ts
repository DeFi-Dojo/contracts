import { time } from "@openzeppelin/test-helpers";

type Time = { latest: () => Promise<string> };
export const latestTime = async () => (time as Time).latest().then(Number);
export const increaseTime = async (timestamp: number) =>
  time.increaseTo(timestamp);
