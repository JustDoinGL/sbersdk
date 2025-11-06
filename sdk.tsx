// components/FiltersModal.tsx
import { FC } from "react";
import styles from "./FiltersModal.module.css";

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  children?: React.ReactNode;
}

export const FiltersModal: FC<FiltersModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Фильтры</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.content}>
          {children}
        </div>
        
        <div className={styles.footer}>
          <button className={styles.applyButton} onClick={onApplyFilters}>
            Применить фильтры
          </button>
        </div>
      </div>
    </div>
  );
};



// components/activities/ActivityFilters.tsx
import { FC, useState } from "react";
import { FiltersModal } from "../FiltersModal";
import styles from "./ActivityFilters.module.css";

interface ActivityFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: ActivityFiltersData) => void;
  initialFilters?: ActivityFiltersData;
}

export interface ActivityFiltersData {
  deadline?: string;
  types: string[];
  statuses: string[];
  insuranceTypes: string[];
  clientName?: string;
}

export const ActivityFilters: FC<ActivityFiltersProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters = {
    types: [],
    statuses: [],
    insuranceTypes: [],
  }
}) => {
  const [filters, setFilters] = useState<ActivityFiltersData>(initialFilters);

  const handleFilterChange = (key: keyof ActivityFiltersData, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  return (
    <FiltersModal
      isOpen={isOpen}
      onClose={onClose}
      onApplyFilters={handleApply}
    >
      <div className={styles.filters}>
        {/* Крайний срок */}
        <div className={styles.filterGroup}>
          <label>Крайний срок</label>
          <input
            type="date"
            value={filters.deadline || ""}
            onChange={(e) => handleFilterChange("deadline", e.target.value)}
          />
        </div>

        {/* Тип */}
        <div className={styles.filterGroup}>
          <label>Тип {filters.types.length}/3 ▼</label>
          <div className={styles.checkboxGroup}>
            {["Тип 1", "Тип 2", "Тип 3"].map((type) => (
              <label key={type}>
                <input
                  type="checkbox"
                  checked={filters.types.includes(type)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...filters.types, type]
                      : filters.types.filter(t => t !== type);
                    handleFilterChange("types", newTypes);
                  }}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* Статус */}
        <div className={styles.filterGroup}>
          <label>Статус {filters.statuses.length}/3 ▼</label>
          <div className={styles.checkboxGroup}>
            {["Статус 1", "Статус 2", "Статус 3"].map((status) => (
              <label key={status}>
                <input
                  type="checkbox"
                  checked={filters.statuses.includes(status)}
                  onChange={(e) => {
                    const newStatuses = e.target.checked
                      ? [...filters.statuses, status]
                      : filters.statuses.filter(s => s !== status);
                    handleFilterChange("statuses", newStatuses);
                  }}
                />
                {status}
              </label>
            ))}
          </div>
        </div>

        {/* Вид страхования */}
        <div className={styles.filterGroup}>
          <label>Вид страхования {filters.insuranceTypes.length}/3 ▼</label>
          <div className={styles.checkboxGroup}>
            {["Вид 1", "Вид 2", "Вид 3"].map((insuranceType) => (
              <label key={insuranceType}>
                <input
                  type="checkbox"
                  checked={filters.insuranceTypes.includes(insuranceType)}
                  onChange={(e) => {
                    const newInsuranceTypes = e.target.checked
                      ? [...filters.insuranceTypes, insuranceType]
                      : filters.insuranceTypes.filter(it => it !== insuranceType);
                    handleFilterChange("insuranceTypes", newInsuranceTypes);
                  }}
                />
                {insuranceType}
              </label>
            ))}
          </div>
        </div>

        {/* ФИО клиента */}
        <div className={styles.filterGroup}>
          <label>ФИО клиента</label>
          <input
            type="text"
            placeholder="Введите ФИО"
            value={filters.clientName || ""}
            onChange={(e) => handleFilterChange("clientName", e.target.value)}
          />
        </div>
      </div>
    </FiltersModal>
  );
};


// Обновленный ActivitiesPageMobile
export const ActivitiesPageMobile: FC = () => {
  const { push } = userToast();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<ActivityFiltersData>({
    types: [],
    statuses: [],
    insuranceTypes: [],
  });

  const {
    data: activities,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["activities.mobile", currentFilters], // Добавляем фильтры в queryKey
    queryFn: (meta) => fetchActivities(meta.pageParam, currentFilters),
    initialPageParam: 1,
    getNextPageParam: (result) => result.next,
    select: (result) => result.pages.flatMap((page) => page.data) || [],
  });

  // Функция для применения фильтров
  const handleApplyFilters = (filters: ActivityFiltersData) => {
    setCurrentFilters(filters);
    // Query автоматически перезапустится из-за изменения queryKey
  };

  // Обновляем функцию fetchActivities для поддержки фильтров
  async function fetchActivities(
    pageParam: number, 
    filters: ActivityFiltersData
  ): Promise<PageResp> {
    const res = await getActivitiesWithFilters({
      page: pageParam,
      page_size: PAGE_SIZE,
      ...filters, // передаем фильтры в API
    });
    
    const urlObj = new URL(res.next ? res.next : "");
    const urlParams = new URLSearchParams(urlObj.search).get("page");
    const next = Number(urlParams) ? Number(urlParams) : undefined;
    
    return { data: res.results, next };
  }

  // ... остальной код виртуализации ...

  return (
    <>
      {/* Кнопка для открытия фильтров */}
      <button 
        className={styles.filtersButton}
        onClick={() => setIsFiltersOpen(true)}
      >
        Фильтры
      </button>

      {/* Модалка фильтров */}
      <ActivityFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={currentFilters}
      />

      {/* Остальной JSX */}
      <div className={styles.wrap} style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          // ... ваш существующий код для рендеринга элементов ...
        ))}
      </div>
    </>
  );
};


