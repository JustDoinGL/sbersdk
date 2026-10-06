const contractStatusConfig = [
  {
    condition: (contract: Contract) => contract.terminated,
    label: 'Завершён',
    color: colors.gray,
  },
  {
    condition: (contract: Contract) => contract.prolongation_available,
    label: 'Истекает',
    color: colors.orange,
  },
  {
    condition: () => true,
    label: 'Действует',
    color: colors.green,
  },
];

const getContractStatus = (contract: Contract) =>
  contractStatusConfig.find(({ condition }) => condition(contract));