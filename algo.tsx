import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

type Props = FormData & {
  control: any;
  clients: Array<{
    value: string;
    label: string;
  }>;
  index: number;
  name: string;
  rest?: unknown;
};

export const GroupUsersSelect = ({
  control,
  clients,
  index,
  name,
  ...rest
}: Props) => {
  const form = useFormContext<AccidentSchema>();

  /**
   * Все группы застрахованных
   */
  const insuredGroups =
    useWatch({
      control: form.control,
      name: "insuredGroups",
    }) ?? [];

  /**
   * Все insured
   */
  const insureds =
    useWatch({
      control: form.control,
      name: "insureds",
    }) ?? [];

  /**
   * Policyholder — одна сущность,
   * поэтому приводим его к массиву и дальше
   * работаем с ним так же, как с insured.
   */
  const policyholder = useWatch({
    control: form.control,
    name: "policyholder",
  });

  /**
   * Текущая группа
   */
  const currentGroup = insuredGroups[index];

  /**
   * Все люди в одном массиве.
   *
   * Дальше нам вообще не важно,
   * policyholder это или insured.
   */
  const people = [
    ...(policyholder ? [policyholder] : []),
    ...insureds,
  ];

  /**
   * ID людей, которые входят в текущую группу.
   *
   * Set позволяет быстро проверять наличие ID:
   * O(1) вместо поиска по массиву.
   */
  const groupClientIds = new Set(currentGroup?.clientIds ?? []);

  /**
   * Есть ли в текущей группе человек,
   * у которого occupationType отличается от "employed".
   */
  const hasNonEmployedPerson = people.some(
    (person) =>
      groupClientIds.has(person.clientId) &&
      person.profession?.occupationType !== "employed",
  );

  /**
   * Поле формы для текущей группы.
   */
  const hasUnemployedKey =
    `insuredGroups.${index}.hasUnemployed` as const;

  /**
   * Если в группе есть человек не с occupationType = "employed",
   * устанавливаем соответствующий флаг.
   *
   * Также, если trauma включен,
   * принудительно устанавливаем sumInsuredMethod = "byRisk".
   */
  useEffect(() => {
    form.setValue(hasUnemployedKey, hasNonEmployedPerson);

    if (!hasNonEmployedPerson) {
      return;
    }

    const isEnabledTrauma = form.getValues(
      `insuredGroups.${index}.risk.trauma.enabled`,
    );

    if (!isEnabledTrauma) {
      return;
    }

    form.setValue(
      `insuredGroups.${index}.risk.trauma.dictionaries.sumInsuredMethod`,
      "byRisk",
    );
  }, [
    form,
    hasNonEmployedPerson,
    hasUnemployedKey,
    index,
  ]);

  /**
   * Клиенты, которые уже используются
   * в других группах.
   */
  const currentFields = form.watch("insuredGroups") ?? [];

  const optionGroupUsers = clients.filter(
    (client) =>
      !currentFields.some(
        (field, fieldIndex) =>
          fieldIndex !== index &&
          field.clientIds?.includes(client.value),
      ),
  );

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <GroupUsersSelect
          {...rest}
          {...field}
          clients={optionGroupUsers}
          error={fieldState.error?.message}
        />
      )}
    />
  );
};