import { dateUtils } from "../../../../5_shared/date";
import { OutputAccidentSchema } from "./schema";

const createInsuranceItem = (
  clientId: string,
  insured: OutputAccidentSchema["insureds"][number] | undefined,
  groupIndex: number,
) => ({
  id: `${groupIndex}`,
  objectRef: clientId,
  sumInsured: 50_000,
  insuranceVariant: "universal",
  elementaryRisk: "deathAccident",
  programId: "2dd6cd83-6e6b-4c2d-98da-bb40eb85e833",
  elementaryRiskId: "a966d8ae-eb6e-48de-894a-afd164f3a9bb",

  attributes: {
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
  },
});

export const mapDataToCalculationRequest = (
  data: OutputAccidentSchema,
) => {
  const {
    insuredGroups,
    startDate,
    endDate,
    insureds,
  } = data;

  /**
   * O(1) поиск застрахованного по clientId
   */
  const insuredByClientId = new Map(
    insureds.map((insured) => [
      insured.clientId,
      insured,
    ]),
  );

  /**
   * O(1) поиск группы по clientId
   */
  const groupIndexByClientId = new Map<string, number>();

  insuredGroups.forEach((group, index) => {
    group.clientIds.forEach((clientId) => {
      groupIndexByClientId.set(clientId, index);
    });
  });

  /**
   * objects
   */
  const objects = insureds.map((insured) => {
    const groupIndex =
      groupIndexByClientId.get(insured.clientId);

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

  /**
   * items
   */
  const items = insuredGroups.flatMap((group, groupIndex) => {
    const createItems = (
      enabled: boolean,
    ) => {
      if (!enabled) {
        return [];
      }

      return group.clientIds.map((clientId) =>
        createInsuranceItem(
          clientId,
          insuredByClientId.get(clientId),
          groupIndex,
        ),
      );
    };

    return [
      ...createItems(group.trauma.enabled),
      ...createItems(group.disability.enabled),
    ];
  });

  return {
    objects,
    items,

    startDate: dateUtils.getDtoDate(startDate),
    endDate: dateUtils.getDtoDate(endDate),

    sumInsuredMethod: "EQUAL_FOR_ALL",
    sumInsuredOrder: "SEPARATE",
  };
};