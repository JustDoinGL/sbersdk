// Если нужно преобразовать фильтры фронта в DTO для бэка
export const FILTER_MAPPER: Record<string, string> = {
  'deal_number': 'deal_number',
  'client_name': 'client_name', 
  'completion_date': 'completion_date',
  'act_type': 'type',
  'status': 'status',
};

export const mapFiltersToFilterDto = (
  filters: Record<string, any>,
  mapper: Record<string, string>
): Record<string, any> => {
  const result: Record<string, any> = {};
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      const dtoKey = mapper[key] || key;
      result[dtoKey] = value;
    }
  });
  
  return result;
};


interface TableFiltersProps {
  filters: Record<string, any>;
  filterConfig: FilterConfig[];
  onFilterChange: (filters: Record<string, any>) => void;
  onReset: () => void;
}

export const TableFilters: FC<TableFiltersProps> = ({
  filters,
  filterConfig,
  onFilterChange,
  onReset,
}) => {
  const [localFilters, setLocalFilters] = useState<Record<string, any>>(filters);
  const [isOpen, setIsOpen] = useState(false);

  // Синхронизируем локальные фильтры при изменении пропсов
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onFilterChange(localFilters);
    setIsOpen(false);
  };

  const handleClear = () => {
    setLocalFilters({});
    onReset();
    setIsOpen(false);
  };

  const updateLocalFilter = (key: string, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderFilterInput = (config: FilterConfig) => {
    const value = localFilters[config.key];

    switch (config.type) {
      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => updateLocalFilter(config.key, e.target.value)}
            placeholder={config.placeholder}
          />
        );

      case 'multiselect':
        return (
          <Select
            mode="multiple"
            value={Array.isArray(value) ? value : []}
            onChange={(selectedValues) => updateLocalFilter(config.key, selectedValues)}
            options={config.options}
            placeholder={config.placeholder}
            style={{ width: '100%' }}
          />
        );

      case 'date':
        return (
          <DatePicker
            value={value ? dayjs(value) : null}
            onChange={(date) => updateLocalFilter(config.key, date?.format('YYYY-MM-DD'))}
            placeholder={config.placeholder}
            style={{ width: '100%' }}
          />
        );

      default:
        return null;
    }
  };

  // Счетчик активных фильтров
  const activeFiltersCount = Object.keys(filters).filter(key => 
    filters[key] !== undefined && 
    filters[key] !== null && 
    filters[key] !== '' &&
    (!Array.isArray(filters[key]) || filters[key].length > 0)
  ).length;

  return (
    <div className={styles.filtersContainer}>
      <Button 
        type="primary"
        onClick={() => setIsOpen(true)}
        icon={<FilterOutlined />}
      >
        Фильтры
        {activeFiltersCount > 0 && (
          <span className={styles.filterBadge}>
            {activeFiltersCount}
          </span>
        )}
      </Button>

      <Modal
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={null}
        width={600}
        title="Фильтры"
      >
        <div className={styles.filtersContent}>
          <div className={styles.filtersHeader}>
            <Button type="link" onClick={handleClear}>
              Очистить все
            </Button>
          </div>

          <div className={styles.filtersGrid}>
            {filterConfig.map((config) => (
              <div key={config.key} className={styles.filterItem}>
                <div className={styles.filterLabel}>{config.label}</div>
                {renderFilterInput(config)}
              </div>
            ))}
          </div>

          <div className={styles.filtersActions}>
            <Button type="primary" onClick={handleApply}>
              Применить фильтры
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              Отмена
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};


export const ActsArchiverable: FC = () => {
  const { handleTableStateChange, filters, pagination, sorter } = useTableState<TableDeal>();
  const { 
    filters: currentFilters, 
    handleFilterChange, 
    handleResetFilters 
  } = useTableFilters<TableDeal, ActFilterDto>();

  const { entities, isLoading, error, count, handleLoadEntities } = useEntityTable<
    TableDeal,
    ActDto
  >({
    entityGetter: async (filters, sorter, pagination) => {
      return api.act_methods.getActs({
        ...mapSorterToSorterDto(sorter),
        ...pagination,
        filters: mapFiltersToFilterDto(filters, FILTER_MAPPER),
      });
    },
    entityMapper: mapDealsDtoToColumnDeals,
    filters: currentFilters, // Используем фильтры из хука
    sorter,
    pagination,
  });

  // Конфигурация фильтров для архива актов
  const filterConfig = [
    {
      key: 'deal_number',
      label: 'Номер сделки',
      type: 'text' as const,
      placeholder: 'Введите номер сделки',
    },
    {
      key: 'client_name', 
      label: 'ФИО клиента',
      type: 'text' as const,
      placeholder: 'Введите ФИО клиента',
    },
    {
      key: 'completion_date',
      label: 'Дата окончания',
      type: 'date' as const,
      placeholder: 'Выберите дату',
    },
    {
      key: 'act_type',
      label: 'Тип акта',
      type: 'multiselect' as const,
      options: [
        { label: 'Посещение ТП', value: 'visit' },
        { label: 'Звонок клиенту', value: 'call' },
        { label: 'Встреча', value: 'meeting' },
      ],
    },
    {
      key: 'status',
      label: 'Статус',
      type: 'multiselect' as const,
      options: [
        { label: 'Выполнено', value: 'completed' },
        { label: 'В работе', value: 'in_progress' },
        { label: 'Отменено', value: 'cancelled' },
      ],
    },
  ];

  return (
    <div className={styles.container}>
      {/* Компонент фильтров */}
      <TableFilters
        filters={currentFilters}
        filterConfig={filterConfig}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />
      
      <EntityTable<TableDeal>
        className={styles.table}
        columns={getColumns()}
        dataTestId={"act-table-archive"}
        rowKey={(record) => record.origin.id}
        pagination={pagination}
        dataSource={entities}
        loading={isLoading}
        onChange={handleTableStateChange}
      />
    </div>
  );
};


export const useTableFilters = <TableRow, FilterDto>() => {
  const { handleTableStateChange, filters, pagination, sorter } = useTableState<TableRow>();
  
  // Обработчик изменения фильтров
  const handleFilterChange = (newFilters: Record<string, any>) => {
    handleTableStateChange(
      {
        ...pagination,
        current: 1, // Всегда сбрасываем на первую страницу при фильтрации
      },
      sorter,
      newFilters,
      { action: 'filter' }
    );
  };

  // Обработчик изменения отдельного фильтра
  const handleSingleFilterChange = (key: string, value: any) => {
    handleFilterChange({
      ...filters,
      [key]: value,
    });
  };

  // Сброс всех фильтров
  const handleResetFilters = () => {
    handleTableStateChange(
      {
        ...pagination,
        current: 1,
      },
      sorter,
      {}, // Очищаем все фильтры
      { action: 'filter' }
    );
  };

  return {
    filters,
    handleFilterChange,
    handleSingleFilterChange,
    handleResetFilters,
  };
};


