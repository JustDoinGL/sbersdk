export const getSchemaKeys = (insuranceCount: number) =>
  Array.from({ length: insuranceCount }, (_, index) =>
    getSchemaKeysFromSchema(accidentInsuredPersonSchema).map(
      (str) => `insurance.${index}.${str}`,
    ),
  ).flat();