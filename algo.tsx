// useInfiniteScroll.ts
type Args<TData> = {
    queryKey: readonly unknown[];
    queryFn: QueryFunction<{ data: TData[]; next?: number }>;
    initialPageParam?: number;
};

export const useInfiniteScroll = <TData>(args: Args<TData>) => {
    const { queryKey, queryFn, initialPageParam = 1 } = args;

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const {
        data: activitiesData,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery({
        queryKey,
        queryFn,
        initialPageParam,
        getNextPageParam: (lastPage) => lastPage.next,
        select: (data) => ({
            ...data,
            flatData: data.pages.flatMap((page) => page.data || [])
        }),
    });

    const flatActivitiesData = activitiesData?.flatData || [];

    // ... остальной код
};