import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';

export const useTableState = <TableRow>(initialFilters: Record<string, string> = {}) => {
    const { pathname } = useLocation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Общая функция для обновления URL
    const updateURL = (updater: (params: URLSearchParams) => void): ReturnType<typeof getParamsByURL> => {
        const newParams = new URLSearchParams(searchParams);
        updater(newParams);
        
        // Ключевое изменение: используем navigate с replace: true вместо router.replace
        navigate(`${pathname}?${newParams.toString()}`, { 
            replace: true, 
            scroll: false 
        });
        
        // Сохраняем в storage если нужно
        sessionStorage.setItem(pathname, newParams.toString());
        
        return getParamsByURL(initialFilters, newParams);
    };

    const handleTableStateChange = (
        pagination: TablePaginationConfig,
        filters: Record<string, FilterValue | null>,
        sorter: SorterResult<TableRow> | SorterResult<TableRow>[],
        extra: TableCurrentDataSource<TableRow>,
    ): ReturnType<typeof getParamsByURL> => {
        return updateURL((params) => {
            if (extra.action === "sort" && !Array.isArray(sorter)) {
                if (sorter.field && sorter.order) {
                    params.set("column", String(sorter.field));
                    params.set("order", String(sorter.order));
                } else {
                    params.delete("column");
                    params.delete("order");
                }
                params.set("page", "1");
            }

            if (extra.action === "paginate") {
                if (pagination.current && pagination.pageSize) {
                    params.set("page", String(pagination.current));
                    params.set("page_size", String(pagination.pageSize));
                    
                    // Сохраняем в localStorage для page_size
                    const pageSize = params.get("page_size");
                    if (pageSize) {
                        localStorage.setItem(
                            pathname,
                            new URLSearchParams({ page_size: pageSize }).toString()
                        );
                    }
                }
            }

            if (extra.action === "filter") {
                const filterEntities = Object.entries(filters);
                filterEntities.forEach(([key, values]) => {
                    if (!values) {
                        params.delete(key);
                    } else if (Array.isArray(values)) {
                        params.set(key, values.join(","));
                    } else if (typeof values === "string") {
                        params.set(key, values);
                    }
                });
                params.set("page", "1");
            }
        });
    };

    const handleResetFilters = (): ReturnType<typeof getParamsByURL> => {
        return updateURL((params) => {
            // Сохраняем только системные параметры
            const pageSize = searchParams.get("page_size");
            const column = searchParams.get("column");
            const order = searchParams.get("order");
            
            // Очищаем все параметры
            params.forEach((_, key) => params.delete(key));
            
            // Восстанавливаем только нужные
            params.set("page", "1");
            if (pageSize) params.set("page_size", pageSize);
            if (column) params.set("column", column);
            if (order) params.set("order", order);
        });
    };

    const handleRangeChange = (filter: Record<string, string | null>): ReturnType<typeof getParamsByURL> => {
        return updateURL((params) => {
            const entries = Object.entries(filter);
            entries.forEach(([key, value]) => {
                if (value) {
                    params.set(key, value);
                } else {
                    params.delete(key);
                }
            });
            params.set("page", "1");
        });
    };

    const handleSearchChange = (search: string): ReturnType<typeof getParamsByURL> => {
        return updateURL((params) => {
            if (search) {
                params.set("search", search);
            } else {
                params.delete("search");
            }
            params.set("page", "1");
        });
    };

    const handleScopeChange = ({
        scope,
        segment,
    }: {
        scope: Scope;
        segment: Segment;
    }): ReturnType<typeof getParamsByURL> => {
        return updateURL((params) => {
            if (scope) {
                params.set("scope", scope);
            } else {
                params.delete("scope");
            }

            if (segment) {
                params.set("segment", segment.toString());
            } else {
                params.delete("segment");
            }
            params.set("page", "1");
        });
    };

    const { filters, sorter, pagination } = getParamsByURL(initialFilters, searchParams);

    return {
        handleTableStateChange,
        handleResetFilters,
        handleRangeChange,
        handleSearchChange,
        handleScopeChange,
        filters,
        sorter,
        pagination
    };
};