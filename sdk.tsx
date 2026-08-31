import { dateUtils } from "../../../../../../5_shared/date";
import {
  InputCreateAgreements,
  InputCreateCalculation,
} from "/5_api";
import { OutputAccidentsSchema } from "./schema";

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
    elementaryRiskId: "383f9aa0-b876-4b27-93ca-952b242cb694",
  },
  temporaryDisabilityHealth: {
    elementaryRisk: "temporaryDisabilityHealth",
    elementaryRiskId: "e1894f8e-d83d-4607-b298-69cef80ecc78",
  },
} as const;

const PROGRAM_ID = "2dd6cd83-6e6b-4c2d-98da-bb40eb85e833";

type Insured = OutputAccidentsSchema["insured"][number];
type InsuredGroup = OutputAccidentsSchema["insuredGroups"][number];
type CalculationItem = InputCreateCalculation["items"][number];
type CalculationObject = InputCreateCalculation["objects"][number];

type Risk = keyof typeof RISK_CONFIG;

const createCoefficientAttributes = (
  insured: Insured | undefined,
) => ({
  insuredQuantity: 1,
  professionKind: insured?.occupationType as string,
  ...(insured?.occupationType === "employed" && {
    professionId: insured.profession,
  }),
});

const createAdditionalCoverageAttributes = (
  group: InsuredGroup,
) => ({
  antimitе:
    group.coveragePeriod === "24 часа"
      ? group.details.additionalCoverage.antiTick
      : false,

  toxicoinfectionFood:
    group.coveragePeriod === "24 часа"
      ? group.details.additionalCoverage.foodPoisoning
      : false,

  improperMedicalManipulations:
    group.coveragePeriod === "24 часа"
      ? group.details.additionalCoverage.medicalErrors
      : false,

  active:
    group.coveragePeriod === "24 часа"
      ? group.details.additionalCoverage.activeLeisure
      : false,

  sport:
    (group.coveragePeriod === "24 часа"
      ? group.details.sportsActivity
      : false) || group.coveragePeriod === "Спорт",

  sportTypesIds:
    "sportsParams" in group.details
      ? group.details.sportsParams.types.map((item) => item.value)
      : [],
});

const createBaseAttributes = (
  group: InsuredGroup,
  insured: Insured | undefined,
  termDays: number,
  payoutOption: string,
) => ({
  baseRateAttributes: {
    coveragePeriod: group.coveragePeriod as string,
    payoutOption,
  },

  coefficientAttributes: {
    ...createCoefficientAttributes(insured),
  },

  sumInsuredOrder: "general",

  duration: termDays,

  ...createAdditionalCoverageAttributes(group),
});

const createInsuranceItem = (
  clientId: string,
  sumInsured: number,
  groupIndex: number,
  risk: Risk,
  attributes: CalculationItem["attributes"],
): CalculationItem => {
  const riskConfig = RISK_CONFIG[risk];

  return {
    id: `${clientId}_${groupIndex}_${risk}` as string,
    objectRef: clientId,
    sumInsured,
    insuranceVariant: "universal",
    elementaryRisk: riskConfig.elementaryRisk as string,
    programId: PROGRAM_ID as string,
    elementaryRiskId: riskConfig.elementaryRiskId as string,
    attributes,
  };
};

const createDeathItem = ({
  group,
  insured,
  clientId,
  groupIndex,
  sumInsured,
  termDays,
}: {
  group: InsuredGroup;
  insured: Insured | undefined;
  clientId: string;
  groupIndex: number;
  sumInsured: number;
  termDays: number;
}): CalculationItem =>
  createInsuranceItem(
    clientId,
    sumInsured,
    groupIndex,
    "death",
    createBaseAttributes(
      group,
      insured,
      termDays,
      "В % от страховой суммы",
    ),
  );

const createDisabilityItem = ({
  group,
  insured,
  clientId,
  groupIndex,
  sumInsured,
  termDays,
}: {
  group: InsuredGroup;
  insured: Insured | undefined;
  clientId: string;
  groupIndex: number;
  sumInsured: number;
  termDays: number;
}): CalculationItem =>
  createInsuranceItem(
    clientId,
    sumInsured,
    groupIndex,
    "disability",
    createBaseAttributes(
      group,
      insured,
      termDays,
      "В % от страховой суммы",
    ),
  );

const createTraumaItem = ({
  group,
  insured,
  clientId,
  groupIndex,
  sumInsured,
  termDays,
}: {
  group: InsuredGroup;
  insured: Insured | undefined;
  clientId: string;
  groupIndex: number;
  sumInsured: number;
  termDays: number;
}): CalculationItem => {
  const risk =
    insured?.occupationType === "employed"
      ? "temporaryDisabilityWork"
      : "temporaryDisabilityHealth";

  const payoutOption =
    group.trauma.enabled &&
    group.trauma.sumInsuredMethod === "byRisk"
      ? "Таблица выплат"
      : "В % за дни";

  return createInsuranceItem(
    clientId,
    sumInsured,
    groupIndex,
    risk,
    {
      ...createBaseAttributes(
        group,
        insured,
        termDays,
        payoutOption,
      ),

      coefficientAttributes: {
        ...createCoefficientAttributes(insured),

        ...(group.trauma.enabled &&
          group.trauma.sumInsuredMethod === "byRisk" && {
            payPercent: Number(group.trauma.payoutsPerDay),
          }),
      },
    },
  );
};

const calculateTotalSumCount = (
  group: InsuredGroup,
): number => {
  let count = 1;

  if (
    group.disability.enabled &&
    group.insuranceSumMode === "UNIFED"
  ) {
    count += 1;
  }

  if (
    group.trauma.enabled &&
    group.insuranceSumMode === "UNIFED"
  ) {
    count += 1;
  }

  return count;
};

const createGroupNames = (
  group: InsuredGroup,
  groupIndex: number,
  insured: Insured | undefined,
): string[] => {
  const names = [`${groupIndex}_death`];

  if (group.disability.enabled) {
    names.push(`${groupIndex}_disability`);
  }

  if (group.trauma.enabled) {
    const traumaRisk =
      insured?.occupationType === "employed"
        ? "temporaryDisabilityWork"
        : "temporaryDisabilityHealth";

    names.push(`${groupIndex}_${traumaRisk}`);
  }

  return names;
};

const createObject = ({
  insured,
  group,
  groupIndex,
}: {
  insured: Insured;
  group: InsuredGroup;
  groupIndex: number;
}): CalculationObject => {
  const totalSumCount = calculateTotalSumCount(group);

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

    sumInsured:
      group.groupSumInsured * totalSumCount,

    groupNames: createGroupNames(
      group,
      groupIndex,
      insured,
    ),
  };
};

const createGroupItems = ({
  group,
  insured,
  clientId,
  groupIndex,
  termDays,
}: {
  group: InsuredGroup;
  insured: Insured | undefined;
  clientId: string;
  groupIndex: number;
  termDays: number;
}): CalculationItem[] => {
  const items: CalculationItem[] = [];

  let sumInsured = group.groupSumInsured;

  if (group.death.enabled) {
    if (group.insuranceSumMode === "SEPARATE") {
      sumInsured = group.death.sum;
    }

    items.push(
      createDeathItem({
        group,
        insured,
        clientId,
        groupIndex,
        sumInsured,
        termDays,
      }),
    );
  }

  if (group.disability.enabled) {
    if (group.insuranceSumMode === "SEPARATE") {
      sumInsured = group.disability.sum;
    }

    items.push(
      createDisabilityItem({
        group,
        insured,
        clientId,
        groupIndex,
        sumInsured,
        termDays,
      }),
    );
  }

  if (group.trauma.enabled) {
    if (group.insuranceSumMode === "SEPARATE") {
      sumInsured = group.trauma.sum;
    }

    items.push(
      createTraumaItem({
        group,
        insured,
        clientId,
        groupIndex,
        sumInsured,
        termDays,
      }),
    );
  }

  return items;
};

export const mapDataToCalculationRequest = (
  data: OutputAccidentsSchema,
): InputCreateCalculation => {
  const {
    insuredGroups,
    startDate,
    endDate,
    insured,
    termDays,
  } = data;

  const insuredByClientId = new Map(
    insured.map((item) => [
      item.clientId,
      item,
    ]),
  );

  const groupIndexByClientId = new Map<
    string,
    number
  >();

  insuredGroups.forEach(
    (group, groupIndex) => {
      group.clientIds.forEach((clientId) => {
        groupIndexByClientId.set(
          clientId,
          groupIndex,
        );
      });
    },
  );

  const objects = insured.map((insuredPerson) => {
    const groupIndex =
      groupIndexByClientId.get(
        insuredPerson.clientId,
      );

    if (groupIndex === undefined) {
      throw new Error(
        `Group not found for client ${insuredPerson.clientId}`,
      );
    }

    return createObject({
      insured: insuredPerson,
      group: insuredGroups[groupIndex],
      groupIndex,
    });
  });

  const items = insuredGroups.flatMap(
    (group, groupIndex) =>
      group.clientIds.flatMap((clientId) => {
        const insuredPerson =
          insuredByClientId.get(clientId);

        return createGroupItems({
          group,
          insured: insuredPerson,
          clientId,
          groupIndex,
          termDays,
        });
      }),
  );

  return {
    startDate: dateUtils.toISO(startDate),
    endDate: dateUtils.toISO(endDate),
    objects,
    items,
  };
};