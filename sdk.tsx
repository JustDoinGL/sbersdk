import { dateUtils } from "../../../../5_shared/date";
import { OutputAccidentSchema } from "./schema";

type Insured = OutputAccidentSchema["insureds"][number];

const RISK_CONFIG = {
  death: {
    elementaryRisk: "deathAccident",
    elementaryRiskId: "a966d8ae-eb6e-48de-894a-afd164f3a9bb",
  },

  disability: {
    elementaryRisk: "disability",
    elementaryRiskId: "e54df1b6-f725-4019-913a-6abfb08aea6c",
  },

  temporaryDisabilityWork: {
    elementaryRisk: "temporaryDisabilityWork",
    elementaryRiskId: "e1894f8e-d83d-4607-b298-69cef80ecc78",
  },

  temporaryDisabilityHealth: {
    elementaryRisk: "temporaryDisabilityHealth",
    elementaryRiskId: "383f9a0a-b876-4b27-93ca-952b242cb694",
  },
} as const;

const PROGRAM_ID = "2dd6cd83-6e6b-4c2d-98da-bb40eb85e833";

const createAttributes = (insured?: Insured) => ({
  baseRateAttributes: {
    coveragePeriod: "24 часа",
    payoutOption: "в % от страховой суммы",
  },

  coefficientAttributes: {
    insuredQuantity: 1,
    professionKind: insured?.occupationType,

    ...(insured?.occupationType === "employed" && {
      professionId: insured.profession,
    }),

    sumInsuredOrder: "general",
    duration: 30,
    antimite: true,
    sport: true,
    active: true,
    sportTypesIds: [],
  },
});

const createInsuranceItem = (
  clientId: string,
  insured: Insured | undefined,
  groupIndex: number,
  risk: keyof typeof RISK_CONFIG,
) => {
  const riskConfig = RISK_CONFIG[risk];

  return {
    id: `${groupIndex}-${risk}`,
    objectRef: clientId,
    sumInsured: 50_000,
    insuranceVariant: "universal",

    elementaryRisk: riskConfig.elementaryRisk,
    programId: PROGRAM_ID,
    elementaryRiskId: riskConfig.elementaryRiskId,

    attributes: createAttributes(insured),
  };
};

export const mapDataToCalculationRequest = (
  data: OutputAccidentSchema,
) => {
  const {
    insuredGroups,
    startDate,
    endDate,
    insureds,
  } = data;

  const insuredByClientId = new Map(
    insureds.map((insured) => [
      insured.clientId,
      insured,
    ]),
  );

  const groupIndexByClientId = new Map<string, number>();

  insuredGroups.forEach((group, index) => {
    group.clientIds.forEach((clientId) => {
      groupIndexByClientId.set(clientId, index);
    });
  });

  const objects = insureds.map((insured) => {
    const groupIndex = groupIndexByClientId.get(
      insured.clientId,
    );

    return {
      id: insured.clientId,
      code: "PERSON",
      type: "Individual",
      description: [
        insured.lastName,
        insured.firstName,
        insured.middleName,
      ]
        .filter(Boolean)
        .join(" "),
      sumInsured: 50_000,
      groupNames:
        groupIndex !== undefined
          ? [`${groupIndex}`]
          : [],
    };
  });

  const items = insuredGroups.flatMap(
    (group, groupIndex) =>
      group.clientIds.flatMap((clientId) => {
        const insured =
          insuredByClientId.get(clientId);

        const result = [];

        // Смерть
        if (group.death.enabled) {
          result.push(
            createInsuranceItem(
              clientId,
              insured,
              groupIndex,
              "death",
            ),
          );
        }

        // Инвалидность
        if (group.disability.enabled) {
          result.push(
            createInsuranceItem(
              clientId,
              insured,
              groupIndex,
              "disability",
            ),
          );
        }

        // Травма
        if (group.trauma.enabled) {
          const traumaRisk =
            insured?.occupationType === "employed"
              ? "temporaryDisabilityWork"
              : "temporaryDisabilityHealth";

          result.push(
            createInsuranceItem(
              clientId,
              insured,
              groupIndex,
              traumaRisk,
            ),
          );
        }

        return result;
      }),
  );

  return {
    objects,
    items,
    startDate: dateUtils.getDtoDate(startDate),
    endDate: dateUtils.getDtoDate(endDate),
    sumInsuredMethod: "EQUAL_FOR_ALL",
    sumInsuredOrder: "SEPARATE",
  };
};