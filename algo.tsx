import { TablePaginationConfig, FilterValue, SorterResult } from 'antd/es/table/interface';
import { useState } from 'react';

const FILTER_MAPPER = {
  stage: "deal_stages",
  client: "search",
  end_date: ["end_date_from", "end_date_to"],
  insurance: "insurance_types",
  start_date: ["start_date_from", "start_date_to"],
  prolongation_end_date: ["prolongation_end_date_from", "prolongation_end_date_to"],
  manager: "last_name",
  segment: "business_segment",
};

const ITEMS_VISIBLE = 3;

interface TableDeal {
  origin: {
    id: string | number;
  };
  // другие поля таблицы
}

interface SorterDto {
  column: string;
  order: 'ascend' | 'descend';
}

interface FilterDto {
  [key: string]: string | string[];
}

const ClientDealTable = ({ deal, onClose }: { deal: DealDto; onClose: () => void }) => {
  const [isOpenTable, setIsOpenTable] = useState(false);
  const [tableParams, setTableParams] = useState({
    page_size: 50,
    client: deal.client_data.id,
    start_date_from: getOneYearAgo(),
    start_date_to: getToday(),
  });

  const [tableSort, setTableSort] = useState<SorterDto>({
    column: "id",
    order: "ascend",
  });

  const [tableFilter, setTableFilter] = useState<Record<string, FilterValue | null>>({});
  
  const { isLoading, dealData, error } = useQueryGetDeal(tableParams);
  const entities = mapDealsDtoToColumnDeals(dealData?.results);

  // Хелпер функции для преобразования данных Ant Design
  const mapSorterToSorterDto = (sorter: SorterResult<TableDeal> | SorterResult<TableDeal>[]): SorterDto => {
    if (Array.isArray(sorter)) {
      const firstSorter = sorter[0];
      return {
        column: firstSorter.field as string,
        order: firstSorter.order || 'ascend',
      };
    }
    
    return {
      column: sorter.field as string,
      order: sorter.order || 'ascend',
    };
  };

  const mapFiltersToFilterDto = (
    filters: Record<string, FilterValue | null>,
    nameMap: Record<string, string | string[]>
  ): FilterDto => {
    const filterDto: FilterDto = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.length > 0) {
        const mappedKey = nameMap[key];
        if (Array.isArray(mappedKey)) {
          // Для диапазонов дат
          filterDto[mappedKey[0]] = value[0] as string;
          filterDto[mappedKey[1]] = value[1] as string;
        } else if (mappedKey) {
          // Для обычных фильтров
          filterDto[mappedKey] = value as string[];
        }
      }
    });
    
    return filterDto;
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<TableDeal> | SorterResult<TableDeal>[]
  ) => {
    setTableSort(mapSorterToSorterDto(sorter));
    setTableFilter(mapFiltersToFilterDto(filters, FILTER_MAPPER));
    
    // Обновляем параметры таблицы
    setTableParams(prev => ({
      ...prev,
      page: pagination.current,
      page_size: pagination.pageSize || 50,
      ...mapFiltersToFilterDto(filters, FILTER_MAPPER),
      ordering: mapSorterToSorterDto(sorter).order === 'ascend' 
        ? mapSorterToSorterDto(sorter).column 
        : `-${mapSorterToSorterDto(sorter).column}`
    }));
  };

  return (
    <div>
      <EntityTable<TableDeal>
        columns={getColumns({
          onClose,
          sorter: tableSort,
          filters: tableFilter,
        })}
        dataTestId={"deals-table"}
        rowKey={(record) => record.origin.id}
        pagination={{
          current: 1,
          pageSize: 50,
          total: dealData?.count,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
        dataSource={isOpenTable ? entities : entities.slice(0, ITEMS_VISIBLE)}
        loading={isLoading}
      />
      
      {dealData?.count && dealData.count > ITEMS_VISIBLE ? (
        <div className={styles.button}>
          <Button onClick={() => setIsOpenTable((prev) => !prev)} variant="ghost">
            {isOpenTable ? "Скрыть" : `Показать еще: ${dealData.count - ITEMS_VISIBLE}`}
          </Button>
        </div>
      ) : null}
    </div>
  );
};