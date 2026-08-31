
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
        elementaryRiskId: "383f9a0a-b876-4b27-93ca-952b242cb694",
    },
    temporaryDisabilityHealth: {
        elementaryRisk: "temporaryDisabilityHealth",
        elementaryRiskId: "e1894f8e-d83d-4607-b298-69cef80ecc78",
    },
} as const;

const PROGRAM_ID = "2dd6cd83-6e6b-4c2d-98da-bb40eb85e833";

type Risk = keyof typeof RISK_CONFIG;

const createInsuranceItem = (
    clientId: string,
    sumInsured: number,
    groupIndex: number,
    risk: Risk,
): Omit<InputCreateCalculation["items"][0], "attributes"> => {
    const riskConfig = RISK_CONFIG[risk];

    return {
        id: `${groupIndex}_${risk}`,
        objectRef: clientId,
        sumInsured,
        insuranceVariant: "universal",
        elementaryRisk: riskConfig.elementaryRisk,
        programId: PROGRAM_ID,
        elementaryRiskId: riskConfig.elementaryRiskId,
    };
};

const createCommonAttributes = (
    group: OutputAccidentSchema["insuredGroups"][number],
    insured: OutputAccidentSchema["insureds"][number] | undefined,
    termDays: number,
) => ({
    baseRateAttributes: {
        coveragePeriod: group.coveragePeriod as string,
        payoutOption: "в % от страховой суммы",
    },

    coefficientAttributes: {
        insuredQuantity: 1,
        professionKind: insured?.occupationType as string,

        ...(insured?.occupationType === "employed" && {
            professionId: insured.profession,
        }),

        sumInsuredOrder: "general",
        duration: termDays,

        antimite:
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
                ? group.details.sportsParams.types.map((value) => value.value)
                : [],
    },
});

const createTraumaAttributes = (
    group: OutputAccidentSchema["insuredGroups"][number],
    insured: OutputAccidentSchema["insureds"][number] | undefined,
    termDays: number,
) => {
    const commonAttributes = createCommonAttributes(
        group,
        insured,
        termDays,
    );

    const payoutByRisk = group.trauma.sumInsuredMethod === "byRisk";

    return {
        ...commonAttributes,

        baseRateAttributes: {
            ...commonAttributes.baseRateAttributes,
            payoutOption: payoutByRisk
                ? "Таблица выплат"
                : "в % за дни",
        },

        coefficientAttributes: {
            ...commonAttributes.coefficientAttributes,

            ...(payoutByRisk
                ? {
                      payOutTable: group.trauma.paymentTerms,
                  }
                : {
                      payDays: Number(group.trauma.paidDays),
                      payPercent: Number(group.trauma.payoutsPerDay),
                  }),
        },
    };
};

const getSumInsured = (
    group: OutputAccidentSchema["insuredGroups"][number],
    risk: "death" | "disability" | "trauma",
) => {
    if (group.insuranceSumMode === "SEPARATE") {
        return group[risk].sum;
    }

    return group.groupSumInsured;
};

const getTraumaRisk = (
    insured: OutputAccidentSchema["insureds"][number] | undefined,
): "temporaryDisabilityWork" | "temporaryDisabilityHealth" =>
    insured?.occupationType === "employed"
        ? "temporaryDisabilityWork"
        : "temporaryDisabilityHealth";

const createRiskItem = (
    clientId: string,
    groupIndex: number,
    group: OutputAccidentSchema["insuredGroups"][number],
    insured: OutputAccidentSchema["insureds"][number] | undefined,
    termDays: number,
    risk: "death" | "disability",
): InputCreateCalculation["items"][number] => ({
    ...createInsuranceItem(
        clientId,
        getSumInsured(group, risk),
        groupIndex,
        risk,
    ),
    attributes: createCommonAttributes(
        group,
        insured,
        termDays,
    ),
});

const createTraumaItem = (
    clientId: string,
    groupIndex: number,
    group: OutputAccidentSchema["insuredGroups"][number],
    insured: OutputAccidentSchema["insureds"][number] | undefined,
    termDays: number,
): InputCreateCalculation["items"][number] => {
    const traumaRisk = getTraumaRisk(insured);

    return {
        ...createInsuranceItem(
            clientId,
            getSumInsured(group, "trauma"),
            groupIndex,
            traumaRisk,
        ),
        attributes: createTraumaAttributes(
            group,
            insured,
            termDays,
        ),
    };
};

const createObject = (
    insured: OutputAccidentSchema["insureds"][number],
    groupIndex: number,
    group: OutputAccidentSchema["insuredGroups"][number],
): InputCreateCalculation["objects"][number] => {
    let totalSumCount = 1;

    const groupNames = [`${groupIndex}_death`];

    if (group.disability.enabled) {
        if (group.insuranceSumMode === "UNIFIED") {
            totalSumCount++;
        }

        groupNames.push(`${groupIndex}_disability`);
    }

    if (group.trauma.enabled) {
        if (group.insuranceSumMode === "UNIFIED") {
            totalSumCount++;
        }

        groupNames.push(
            `${groupIndex}_${getTraumaRisk(insured)}`,
        );
    }

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

        sumInsured: group.groupSumInsured * totalSumCount,
        groupNames,
    };
};

const createItemsForClient = (
    clientId: string,
    groupIndex: number,
    group: OutputAccidentSchema["insuredGroups"][number],
    insured: OutputAccidentSchema["insureds"][number] | undefined,
    termDays: number,
): InputCreateCalculation["items"] => {
    const result: InputCreateCalculation["items"] = [];

    if (group.death.enabled) {
        result.push(
            createRiskItem(
                clientId,
                groupIndex,
                group,
                insured,
                termDays,
                "death",
            ),
        );
    }

    if (group.disability.enabled) {
        result.push(
            createRiskItem(
                clientId,
                groupIndex,
                group,
                insured,
                termDays,
                "disability",
            ),
        );
    }

    if (group.trauma.enabled) {
        result.push(
            createTraumaItem(
                clientId,
                groupIndex,
                group,
                insured,
                termDays,
            ),
        );
    }

    return result;
};

export const mapDataToCalculationRequest = (
    data: OutputAccidentSchema,
): InputCreateCalculation => {
    const {
        insuredGroups,
        startDate,
        endDate,
        insureds,
        termDays,
    } = data;

    const insuredByClientId = new Map(
        insureds.map((insured) => [
            insured.clientId,
            insured,
        ]),
    );

    const groupIndexByClientId = new Map<string, number>();

    insuredGroups.forEach((group, groupIndex) => {
        group.clientIds.forEach((clientId) => {
            groupIndexByClientId.set(
                clientId,
                groupIndex,
            );
        });
    });

    const objects = insureds.map((insured) => {
        const groupIndex = groupIndexByClientId.get(
            insured.clientId,
        );

        if (groupIndex === undefined) {
            throw new Error(
                `Insured ${insured.clientId} is not assigned to a group`,
            );
        }

        return createObject(
            insured,
            groupIndex,
            insuredGroups[groupIndex],
        );
    });

    const items = insuredGroups.flatMap(
        (group, groupIndex) =>
            group.clientIds.flatMap((clientId) => {
                const insured =
                    insuredByClientId.get(clientId);

                return createItemsForClient(
                    clientId,
                    groupIndex,
                    group,
                    insured,
                    termDays,
                );
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