// useInfiniteScroll.ts
type Args<TQueryFnData = unknown> = {
    queryOptions: {
        queryKey: readonly unknown[];
        queryFn: QueryFunction<TQueryFnData>;
    };
    getNextPageParam?: (lastPage: TQueryFnData) => unknown;
};

export const useInfiniteScroll = <TQueryFnData = unknown>(args: Args<TQueryFnData>) => {
    // ... implementation
};