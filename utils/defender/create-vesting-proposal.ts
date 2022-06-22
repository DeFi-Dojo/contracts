import { AdminClient } from "defender-admin-client";
import configEnv from "../../config";

const { DEFENDER_TEAM_API_KEY, DEFENDER_TEAM_API_SECRET } = configEnv;

const client = new AdminClient({
  apiKey: DEFENDER_TEAM_API_KEY,
  apiSecret: DEFENDER_TEAM_API_SECRET,
});

type Props = {
  vestingManagement: string;
  gnosisSafe: string;
  beneficiary: string;
  start: string;
  end: string;
  isTerminable?: boolean;
};

export const createAddNewVestingProposal = async ({
  vestingManagement,
  gnosisSafe,
  beneficiary,
  start,
  end,
  isTerminable,
}: Props) => {
  await client.createProposal({
    contract: {
      address: vestingManagement,
      network: "matic",
    },
    title: `Create vesting for: ${beneficiary}`,
    description: `Create vesting for: ${beneficiary}`,
    type: "custom",
    functionInterface: {
      inputs: [
        {
          internalType: "address",
          name: "beneficiaryAddress",
          type: "address",
        },
        {
          internalType: "uint64",
          name: "startTimestamp",
          type: "uint64",
        },
        {
          internalType: "uint64",
          name: "durationSeconds",
          type: "uint64",
        },
      ],
      name: isTerminable ? "addNewTerminableVesting" : "addNewFixedVesting",
    },
    functionInputs: [
      beneficiary,
      (Date.parse(start) / 1000).toString(),
      (Date.parse(end) / 1000).toString(),
    ],
    via: gnosisSafe,
    viaType: "Gnosis Safe",
  });
};
