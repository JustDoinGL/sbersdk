import { calcTermDays } from "./3_forms/policy_period/helper";
import { GetAgreementsResponse } from "./5_api";
import { InputAccidentsSchema } from "./schema";

export const mapResToForm = (
  data: GetAgreementsResponse["data"],
): InputAccidentsSchema => {
  const {
    endOfInsurance,
    startOfInsurance,
    parties,
  } = data;

  const { policyholder, insureds } = Object.values(parties)
    .flat()
    .reduce<{
      policyholder: InputAccidentsSchema["policyholder"] | undefined;
      insureds: InputAccidentsSchema["insureds"];
    }>(
      (acc, party) => {
        const person = {
          clientId: party.personCalculationId,
          clientIdByMrm: "some",
          divisionCode: party.personCalculationId,
          addressType: party.address,
          addressValue: party.address,
          documentNumber: party.documents[0].number,
          documents: party.documents[0],
          documentSeries: party.documents[0].series,
          documentType: party.documents[0].documentType,
          email: party.email,
          firstName: party.firstName,
          gender: party.sex,
          isPolicyHolderInsured: party.roles.includes("insured"),
          issuedBy: party.documents[0].issuer,
          lastName: party.lastName,
          phone: party.phone,
          birthDate: new Date(party.birthDate),
          issueDate: new Date(party.documents[0].issueDate),
          middleName: party.middleName,
          occupationType: "employed",
          profession: "Новая профессия",
          professionId: party.personCalculationId,
        };

        if (party.roles.includes("policyHolder")) {
          acc.policyholder = person;
        }

        if (party.roles.includes("insured")) {
          acc.insureds.push(person);
        }

        return acc;
      },
      {
        policyholder: undefined,
        insureds: [],
      },
    );

  if (!policyholder) {
    throw new Error("Policyholder не найден");
  }

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
  };
};