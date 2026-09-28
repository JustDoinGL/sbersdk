export const mapDataToCalculationRequest = (
  data: OutputAccidentSchema,
): CalculationRequest => {
  const {
    insuredGroups,
    startDate,
    endDate,
    insureds,
    termDays,
    policyholder,
  } = data;

  const personByClientId = new Map(
    [
      ...insureds,
      ...(policyholder ? [policyholder] : []),
    ].map((person) => [
      person.clientId,
      person,
    ]),
  );

  const groupIndexByClientId = new Map<string, number>();

  insuredGroups.forEach((group, groupIndex) => {
    group.clientIds.forEach((clientId) => {
      groupIndexByClientId.set(clientId, groupIndex);
    });
  });

  const objects = Array.from(personByClientId.values())
    .map((person) => {
      const groupIndex = groupIndexByClientId.get(
        person.clientId,
      );

      if (groupIndex === undefined) {
        throw new Error(
          `Person ${person.clientId} is not assigned to a group`,
        );
      }

      return createObject(
        person,
        groupIndex,
        insuredGroups[groupIndex],
      );
    });

  const items = insuredGroups.flatMap(
    (group, groupIndex) =>
      group.clientIds.flatMap((clientId) => {
        const person = personByClientId.get(clientId);

        if (!person) {
          throw new Error(
            `Person ${clientId} not found`,
          );
        }

        return createItemsForClient(
          clientId,
          groupIndex,
          group,
          person,
          termDays,
        );
      }),
  );

  return {
    objects,
    items,
    startDate,
    endDate,
  };
};