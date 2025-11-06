import styles from "./activity_filters.module.css";
import { ControlledDatepickerField } from "@/5_shared/ui";
import { FC } from "react";
import { useForm } from "react-hook-form";

type ActivityFiltersData = {
  deadline?: Date;
  client?: string;
  activity_type?: string;
  activity_status?: string;
  [key: string]: any;
};

type ActivityFiltersProps = {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: ActivityFiltersData) => void;
  initialFilters?: ActivityFiltersData;
};

// Предполагаем, что ModalFilters уже существует и импортирован
const ModalFilters: FC<{
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: () => void;
  children: React.ReactNode;
}> = ({ isOpen, onClose, onApplyFilters, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
        <div className="modal-actions">
          <button onClick={onClose}>Отмена</button>
          <button onClick={onApplyFilters}>Применить</button>
        </div>
      </div>
    </div>
  );
};

export const ActivityFilters: FC<ActivityFiltersProps> = ({ 
  isOpen, 
  onClose, 
  onApplyFilters,
  initialFilters 
}) => {
  const { control, handleSubmit, reset } = useForm<ActivityFiltersData>({
    defaultValues: initialFilters,
  });

  const handleApply = (data: ActivityFiltersData) => {
    const processedFilters: ActivityFiltersData = {};
    
    if (data.deadline) {
      processedFilters.deadline = data.deadline;
    }
    if (data.client) {
      processedFilters.client = data.client;
    }
    
    onApplyFilters(processedFilters);
  };

  const handleReset = () => {
    reset();
    onApplyFilters({});
    onClose();
  };

  return (
    <ModalFilters 
      isOpen={isOpen} 
      onClose={onClose} 
      onApplyFilters={handleSubmit(handleApply)}
    >
      <div className={styles.container}>
        <ControlledDatepickerField
          label="Крайний срок"
          control={control}
          name="deadline"
          minDate={new Date()}
          size="xl"
        />
        
        {/* Добавьте другие поля фильтров по необходимости */}
        
        <div style={{ marginTop: '16px' }}>
          <Button onClick={handleReset} variant="secondary">
            Сбросить
          </Button>
        </div>
      </div>
    </ModalFilters>
  );
};






import { ActivityCardMobile } from "@/3_features/mobile/activity/activity_card/activity_card";
import { getActivitiesByFilters } from "@/4_entities/activity";
import { useTableState, useIntersection } from "@/5_shared/hooks";
import { Button, Spinner, useToast } from "@sg/ulkit";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { FC, useState, useRef, useCallback } from "react";
import styles from "./activities.module.css";
import { ActivityFilters } from "@/3_features/mobile/activity/activity_filters/activity_filters";
import { useUser } from "@/4_entities/profile";
import { mapFiltersToFilterDto, mapSorterToSorterDto } from "@/5_shared/ui";
import { ActivityDto, ReferenceItem } from "@/5_shared/api";

type TableActivity = {
  id: string;
  client: string;
  activity_type: string;
  deadline: string;
  text: string;
  activity_status: ReferenceItem | null;
  result: string;
  origin: ActivityDto;
  deal: string;
  deal_end_date: string;
};

type ActivitiesConfig = {
  PAGE_SIZE: number;
  ESTIMATE_SIZE: number;
  PREFETCH_THRESHOLD: number;
};

const ACTIVITIES_CONFIG: ActivitiesConfig = {
  PAGE_SIZE: 20,
  ESTIMATE_SIZE: 150,
  PREFETCH_THRESHOLD: 5,
};

const SORTER_MAPPER = {
  deal_end_date: "deal_end_date",
  manager: "manager_last_name",
  client: "client_last_name",
};

const FILTER_MAPPER = {
  activity_status: "activity_statuses",
  deadline: ["deadline_from", "deadline_to"],
  activity_type: "activity_types",
  client: "search",
};

type FilterParams = Record<string, any>;
type PaginationParams = Record<string, any>;
type SorterParams = Record<string, any>;

type ActivitiesResponse = {
  results: TableActivity[];
  next: string | null;
};

type ActivitiesPageData = {
  data: TableActivity[];
  next: number | undefined;
};

const getInitialFilters = (
  business_segment: number | null,
  canScope: boolean
): FilterParams =>
  canScope ? { segment: business_segment?.toString() || "", scope: "my" } : {};

type ActivitiesPageMobileProps = {
  canScope?: boolean;
};

export const ActivitiesPageMobile: FC<ActivitiesPageMobileProps> = ({ canScope = false }) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const user = useUser();
  const { push } = useToast();
  const cursorRef = useRef<HTMLDivElement | null>(null);

  const { pagination, filters, sorter, handleTableStateChange } = useTableState<TableActivity>(
    getInitialFilters(user?.business_segment || null, canScope)
  );

  const fetchActivities = useCallback(async (
    paginationParams: PaginationParams,
    filterParams: FilterParams,
    sorterParams: SorterParams
  ): Promise<ActivitiesPageData> => {
    try {
      const res = await getActivitiesByFilters({
        ...mapSorterToSorterDto(sorterParams, SORTER_MAPPER),
        page_size: ACTIVITIES_CONFIG.PAGE_SIZE,
        page: paginationParams.page || 1,
        filters: mapFiltersToFilterDto(filterParams, FILTER_MAPPER),
      });

      const nextPage = res.next
        ? Number(new URLSearchParams(new URL(res.next).search).get("page"))
        : undefined;

      return {
        data: res.results || [],
        next: nextPage && !isNaN(nextPage) ? nextPage : undefined,
      };
    } catch (error) {
      push({
        title: "Ошибка загрузки данных",
        type: "error",
      });
      console.error(error);
      throw error;
    }
  }, [push]);

  const {
    data: activitiesData,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["activities-mobile", filters, sorter],
    queryFn: ({ pageParam = 1 }) => 
      fetchActivities({ ...pagination, page: pageParam }, filters, sorter),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.next,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      flatData: data.pages.flatMap((page) => page.data) || [],
    }),
  });

  const flatActivitiesData = activitiesData?.flatData || [];

  const handleApplyFilters = useCallback((newFilters: FilterParams) => {
    console.log("Applying filters:", newFilters);
    handleTableStateChange({}, newFilters, {});
  }, [handleTableStateChange]);

  const virtualizer = useWindowVirtualizer({
    count: hasNextPage ? flatActivitiesData.length + 1 : flatActivitiesData.length,
    estimateSize: () => ACTIVITIES_CONFIG.ESTIMATE_SIZE,
    overscan: 5,
  });

  useIntersection({
    element: cursorRef,
    onIntersect: () => {
      if (!isFetchingNextPage && hasNextPage) {
        fetchNextPage().catch((error) => {
          console.error("Failed to fetch next page:", error);
          push({ title: "Ошибка загрузки следующей страницы", type: "error" });
        });
      }
    },
    options: {
      threshold: 0.1,
    },
  });

  if (isLoading) {
    return <Spinner size={48} />;
  }

  return (
    <>
      <div className={styles.header}>
        <Button onClick={() => setIsFiltersOpen(true)} variant="secondary">
          Фильтры
        </Button>
      </div>

      <ActivityFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
      />

      <div className={styles.wrap}>
        <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const isLoaded = virtualItem.index < flatActivitiesData.length;
            const activity = flatActivitiesData[virtualItem.index];
            const isObserverItem = virtualItem.index >= flatActivitiesData.length - 1;

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                className={styles.item}
                ref={(el) => {
                  virtualizer.measureElement(el);
                  if (isObserverItem) {
                    cursorRef.current = el;
                  }
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {isLoaded ? (
                  <ActivityCardMobile key={activity.id} activity={activity} />
                ) : (
                  <div style={{ height: ACTIVITIES_CONFIG.ESTIMATE_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Spinner size={32} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {isFetchingNextPage && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
            <Spinner size={32} />
          </div>
        )}
      </div>
    </>
  );
};
