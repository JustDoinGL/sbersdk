import { ActivityCardMobile } from "@/3_features/_mobile/activity/activity_card/activity_card";
import { getActivitiesByFilters } from "@/4_entities/activity";
import { ActivityDto } from "@/5_shared/api";
import { useTransaction, useTableState } from "@/5_shared/hooks";
import { Button, useToast } from "@sg/uikit";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { FC, useCallback, useMemo } from "react";
import styles from "./activities.module.css";
import { ActivityFilters } from "@/3_features/_mobile/activity/activity_filters/activity_filters";
import { useUser } from "@/4_entities/profile";
import { TableActivity } from "@/3_features/activity/activities_table/columns";
import { mapFiltersToFilterDto, mapSorterToSorterDto } from "@/5_shared/ui";
import { FILTER_MAPPER, SORTER_MAPPER } from "./mapper";

// Константы вынести в конфиг
const ACTIVITIES_CONFIG = {
  PAGE_SIZE: 10,
  PREFETCH_THRESHOLD: 5,
  ESTIMATE_SIZE: 150,
} as const;

const getInitialFilters = (
  business_segment: number | null,
  canScope: boolean
): Record<string, string> => 
  canScope ? { segment: business_segment?.toString() || "", scope: "my" } : {};

export const ActivitiesPageMobile: FC<ActivitiesPageMobileProps> = ({ 
  canScope = false 
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const user = useUser();
  const { push } = useToast();
  
  const {
    pagination,
    filters,
    sorter,
    handleTableStateChange,
  } = useTableState<TableActivity>(
    getInitialFilters(user.business_segment, canScope)
  );

  // Исправленный запрос данных
  const {
    data: activitiesData,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["activities-mobile", filters, sorter],
    queryFn: ({ pageParam = 1 }) => fetchActivities(pageParam),
    initialPageParam: 1,
    getNextPageParam: (result) => result.next,
    select: (result) => result.pages.flatMap((page) => page.data) || []
  });

  // Мемоизированная функция загрузки данных
  const fetchActivities = useCallback(async (page: number): Promise<PageResp> => {
    try {
      const res = await getActivitiesByFilters({
        ...mapSorterToSorterDto(sorter, SORTER_MAPPER),
        ...pagination,
        page,
        filters: mapFiltersToFilterDto(filters, FILTER_MAPPER),
      });

      const nextPage = res.next ? 
        Number(new URLSearchParams(new URL(res.next).search).get("page")) : 
        undefined;

      return { 
        data: res.results, 
        next: nextPage && !isNaN(nextPage) ? nextPage : undefined 
      };
    } catch (error) {
      push({ 
        title: "Ошибка загрузки данных", 
        type: "error" 
      });
      throw error;
    }
  }, [filters, sorter, pagination, push]);

  // Обработчик применения фильтров
  const handleApplyFilters = useCallback((props: any) => {
    const { sorter: newSorter, filters: newFilters, pagination: newPagination } = 
      handleTableStateChange(...props);
    
    // Здесь должен быть рефетч данных с новыми параметрами
    // В реальном коде нужно инвалидировать кэш или делать новый запрос
  }, [handleTableStateChange]);

  // Виртуализация
  const virtualizer = useWindowVirtualizer({
    count: (activitiesData?.length || 0) + (hasNextPage ? ACTIVITIES_CONFIG.PAGE_SIZE : 0),
    estimateSize: () => ACTIVITIES_CONFIG.ESTIMATE_SIZE,
    overscan: 3,
    measureElement: (element) => element.getBoundingClientRect().height ?? ACTIVITIES_CONFIG.ESTIMATE_SIZE,
  });

  // Intersection Observer для бесконечной прокрутки
  const cursorRef = useIntersectionObserver(
    useCallback(() => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage().catch(() =>
          push({ 
            title: "Ошибка загрузки следующей страницы", 
            type: "error" 
          })
        );
      }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, push])
  );

  if (!activitiesData) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Кнопка фильтров */}
      <div className={styles.header}>
        <Button 
          onClick={() => setIsFiltersOpen(true)}
          variant="secondary"
        >
          Фильтры
        </Button>
      </div>

      {/* Модалка фильтров */}
      <ActivityFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
      />

      {/* Виртуализированный список */}
      <div 
        className={styles.listContainer} 
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const isLoaded = virtualItem.index < activitiesData.length;
          const activity = activitiesData[virtualItem.index];
          const isObserverItem = 
            activitiesData.length - ACTIVITIES_CONFIG.PREFETCH_THRESHOLD === virtualItem.index;

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              className={styles.item}
              ref={(el) => {
                virtualizer.measureElement(el);
                if (isObserverItem && !isFetchingNextPage) {
                  cursorRef(el);
                }
              }}
              style={{
                transform: `translateY(${virtualItem.start}px)`,
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`
              }}
            >
              {isLoaded ? (
                <ActivityCardMobile 
                  key={activity.id} 
                  activity={activity} 
                />
              ) : (
                <div>Загрузка...</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Индикатор загрузки */}
      {isFetchingNextPage && (
        <div className={styles.loading}>Загрузка...</div>
      )}
    </div>
  );
};