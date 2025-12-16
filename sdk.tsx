const rowSelection = {
  type: 'checkbox', // или 'radio' для радиокнопок
  selections: [
    Table.SELECTION_ALL, // Выбрать все
    Table.SELECTION_INVERT, // Инвертировать выбор
    Table.SELECTION_NONE, // Сбросить выбор
  ],
  hideSelectAll: false, // скрыть чекбокс "Выбрать все"
  fixed: true, // фиксированная позиция
  columnWidth: 60, // ширина колонки
  columnTitle: 'Выбор', // заголовок колонки
};

import { Table, Checkbox } from 'antd';
import { useState } from 'react';

const MyTable = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Age',
      dataIndex: 'age',
    },
  ];

  const data = [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
    // Дополнительные опции:
    getCheckboxProps: (record) => ({
      disabled: record.disabled, // Отключение для конкретных строк
    }),
  };

  return (
    <Table
      rowSelection={rowSelection}
      columns={columns}
      dataSource={data}
    />
  );
};

const columns = [
  {
    title: 'Select',
    dataIndex: 'selected',
    render: (checked, record) => (
      <Checkbox
        checked={checked}
        onChange={(e) => handleCheckboxChange(record.key, e.target.checked)}
      />
    ),
  },
  {
    title: 'Name',
    dataIndex: 'name',
  },
];

// Обработчик изменения
const handleCheckboxChange = (key, checked) => {
  // Ваша логика обработки
};

