import React, { FC } from 'react';
import { Text } from '@your-ui-library'; // замените на ваш путь к Text
import styles from './styles.module.css'; // замените на ваш путь к стилям

// 1. Выносим типы (если их нет в отдельном файле)
type Contract = {
  terminated: boolean;
  prolongation_available: boolean;
  // добавьте остальные поля, если они нужны
};

type Props = {
  end_date: string;
  contract: Contract; // Добавляем contract в пропсы, если он нужен для статуса
};

// 2. Выносим конфиг за пределы компонента, чтобы не пересоздавать его при каждом рендере
const CONTRACT_STATUS_CONFIG = [
  {
    condition: (contract: Contract) => contract.terminated,
    label: 'Завершён',
    color: '#00A043',
  },
  {
    condition: (contract: Contract) => contract.prolongation_available,
    label: 'Истекает',
    color: 'rgba(255, 115, 0, 0.70)',
  },
  {
    condition: () => true, // fallback
    label: 'Действует',
    color: 'rgba(21, 33, 73, 0.50)',
  },
];

export const EndDataComponent: FC<Props> = ({ end_date, contract }) => {
  // 3. Находим статус. Если contract не передан, можно использовать дефолтный статус
  const status = contract 
    ? CONTRACT_STATUS_CONFIG.find(({ condition }) => condition(contract)) 
    : CONTRACT_STATUS_CONFIG[2]; // "Действует" по умолчанию

  const { label, color } = status || CONTRACT_STATUS_CONFIG[2];

  return (
    <div className={styles.container}>
      {/* 4. Передаем текст и цвет в один компонент */}
      <Text font="body_2" style={{ color }}>
        {end_date} — {label}
      </Text>
    </div>
  );
};