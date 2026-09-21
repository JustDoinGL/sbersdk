import { calcTermDays } from "./3_forms/policy_period/helper";
import { GetAgreementsResponse } from "./5_api";
import { InputAccidentsSchema } from "./schema";

export const mapRestToForm = (
  data: GetAgreementsResponse["data"],
): InputAccidentsSchema => {
  const {
    endOfInsurance,
    startOfInsurance,
    parties,
    policyData,
  } = data;

  const { policyholder, insureds } = parties
    .flat()
    .reduce(
      (acc, party) => {
        if (party.roles.includes("policyHolder")) {
          acc.policyholder = party;
        }

        if (party.roles.includes("insured")) {
          acc.insureds.push(party);
        }

        return acc;
      },
      {
        policyholder: undefined,
        insureds: [],
      },
    );

  return {
    startDate: new Date(startOfInsurance),
    endDate: new Date(endOfInsurance),
    termDays: calcTermDays(
      new Date(startOfInsurance),
      new Date(endOfInsurance),
    ),
    insuredGroups: [],
    insureds,
    policyholder,
    policySampleMethod: "personal",
  };
};