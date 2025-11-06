// mapper.ts
import { ActivityDto } from "@/5_shared/api";
import { ActivityFiltersFormSchema } from "./schema";
import { referencesService } from "@/5_shared/reference";

const activityStatus = referencesService.getDictSet("activity_status");
const activityType = referencesService.getDictSet("activity_type");

export const activityTypesOptions = activityType.map((type) => ({ 
  label: type.name, 
  value: type.id.toString(),
}));

export const activityStatusOptions = activityStatus.map((type) => ({ 
  label: type.name, 
  value: type.id.toString(),
}));

export const mapDtoToSchema = (activity: ActivityDto): ActivityFiltersFormSchema => {
  return {
    deal_end_date: activity.deal_end_date ? new Date(activity.deal_end_date) : undefined,
    activity_type: activity.activity_type ? [{ 
      value: activity.activity_type.id.toString(), 
      label: activity.activity_type.name 
    }] : undefined,
    activity_status: activity.activity_status ? [{ 
      value: activity.activity_status.id.toString(), 
      label: activity.activity_status.name 
    }] : undefined,
    client: activity.client || undefined,
  };
};

export const mapSchemaToDto = (schema: ActivityFiltersFormSchema): Record<string, any> => {
  return {
    client: schema.client,
    activity_types: schema.activity_type?.map(item => item.value),
    activity_statuses: schema.activity_status?.map(item => item.value),
    deal_end_date: schema.deal_end_date?.toISOString(),
  };
};



// activity_filters.tsx
import { ModalFilters } from "@/5_shared/ui/_mobile/modal_filters/modal_filters";
import styles from "./activity_filters.module.css";
import {
  ControlledDatePickerField,
  ControlledInputField,
  ControlledMultiselect,
} from "@/5_shared/ui";
import { FC, useState } from "react";
import { Button } from "@sg/uikit";
import { useForm } from "react-hook-form";
import { ActivityFiltersFormSchema } from "./schema";
import { activityStatusOptions, activityTypesOptions } from "./mapper";
import { zodResolver } from "@hookform/resolvers/zod";

type ActivityFiltersProps = {
  onApplyFilters: (filters: any) => void;
  initialFilters?: any;
};

export const ActivityFilters: FC<ActivityFiltersProps> = ({ onApplyFilters, initialFilters }) => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const form = useForm<ActivityFiltersFormSchema>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    resolver: zodResolver(ActivityFiltersFormSchema),
    defaultValues: initialFilters,
  });

  const handleApplyFilters = (data: ActivityFiltersFormSchema) => {
    onApplyFilters(data);
    setIsFilterModalOpen(false);
  };

  const handleReset = () => {
    form.reset();
    onApplyFilters({});
    setIsFilterModalOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsFilterModalOpen(true)} variant="secondary">
        Фильтры
      </Button>

      <ModalFilters
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={form.handleSubmit(handleApplyFilters)}
        onReset={handleReset}
      >
        <form className={styles.form}>
          <ControlledInputField
            control={form.control}
            name="client"
            label="Клиент"
            placeholder="Поиск по клиенту"
          />
          
          <ControlledMultiselect
            control={form.control}
            name="activity_type"
            label="Тип активности"
            options={activityTypesOptions}
            placeholder="Выберите тип"
          />
          
          <ControlledMultiselect
            control={form.control}
            name="activity_status"
            label="Статус активности"
            options={activityStatusOptions}
            placeholder="Выберите статус"
          />
          
          <ControlledDatePickerField
            control={form.control}
            name="deal_end_date"
            label="Дата окончания сделки"
            placeholder="Выберите дату"
          />
        </form>
      </ModalFilters>
    </>
  );
};






// activities.tsx
import { getActivitiesByFilters } from "@/4_entities/activity";
import { useState } from "@/5_shared/hooks";
import { Spinner, useToast } from "@sg/uikit";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import styles from "./activities.module.css";
import { useUser } from "@/4_entities/profile";
import {
  Filters,
  mapFiltersToFilterDto,
  mapSorterToSorterDto,
  Pagination,
  Sorter,
} from "@/5_shared/ui";
import { ActivityDto, ReferenceItem } from "@/5_shared/api";
import { ActivityFilters } from "@/3_features/mobile/activity/activity_filters/activity_filters";
import { ActivityCardMobile } from "@/3_features/mobile/activity/activity_card/activity_card";

type FilterActivity = {
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

const ACTIVITIES_CONFIG = {
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

const getInitialFilters = (business_segment: number | null, canScope: boolean): Record<string, string> =>
  canScope ? { segment: business_segment?.toString() || "", scope: "my" } : {};

type ActivitiesPageMobileProps = {
  canScope?: boolean;
};

export const ActivitiesPageMobile: React.FC<ActivitiesPageMobileProps> = ({ canScope = false }) => {
  const user = useUser();
  const { push } = useToast();

  const [pagination, setPagination] = useState({ page: 1, page_size: ACTIVITIES_CONFIG.PAGE_SIZE });
  const [filters, setFilters] = useState<Filters>(getInitialFilters(user.business_segment, canScope));
  const [sorter, setSorter] = useState<Sorter<FilterActivity>>({ order: "descend", column: "id" });

  const handleTableStateChange = (newPagination: Pagination, newFilters: Filters, newSorter: Sorter<FilterActivity>) => {
    setPagination(newPagination);
    setFilters(newFilters);
    setSorter(newSorter);
  };

  const fetchActivities = async (
    paginationParams: Pagination,
    filterParams: Filters,
    sorterParams: Sorter<FilterActivity>,
  ) => {
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
  };

  const {
    data: activitiesData,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
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

  const handleApplyFilters = (filterParams: Filters) => {
    setFilters(filterParams);
    setPagination({ ...pagination, page: 1 });
  };

  const virtualizer = useWindowVirtualizer({
    count: hasNextPage ? flatActivitiesData.length + 1 : flatActivitiesData.length,
    estimateSize: () => ACTIVITIES_CONFIG.ESTIMATE_SIZE,
    overscan: 5,
  });

  const { ref: cursorRef } = useIntersection({
    threshold: 0.5,
    onChange: (isIntersecting) => {
      if (isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage().catch(() =>
          push({ title: "Ошибка загрузки следующей страницы", type: "error" })
        );
      }
    },
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <ActivityFilters 
          onApplyFilters={handleApplyFilters}
          initialFilters={filters}
        />
      </div>

      <div className={styles.wrap}>
        <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const isLoaded = virtualItem.index < flatActivitiesData.length;
            const activity = flatActivitiesData[virtualItem.index];
            const isObserverItem =
              flatActivitiesData.length - ACTIVITIES_CONFIG.PREFETCH_THRESHOLD === virtualItem.index;

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
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {isLoaded ? (
                  <ActivityCardMobile key={activity.id} activity={activity} />
                ) : (
                  <Spinner size={48} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isFetchingNextPage && (
        <div className={styles.loading}>
          <Spinner size={32} />
        </div>
      )}
    </div>
  );
};

