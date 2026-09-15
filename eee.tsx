const methods = useInfiniteQuery({
  queryKey: ["dictionary", product, code, debouncedQuery],

  initialPageParam: 1,

  queryFn: ({ pageParam, signal }) =>
    fetchData(pageParam, signal),

  getNextPageParam: (lastPage, allPages) => {
    const currentCount = allPages.reduce(
      (acc, page) => acc + page.data.length,
      0,
    );

    if (currentCount >= lastPage.count) {
      return undefined;
    }

    return allPages.length + 1;
  },

  select: (data) => ({
    pages: data.pages,
    pageParams: data.pageParams,
    flatData: data.pages.flatMap((page) => page.data),
  }),
});