export const getDealsByFilters = async ({ client, page, page_size, ordering, filters }: Props) => {
    try {
        const data = await api.deal_methods.getDeals({
            client,
            page,
            page_size,
            ordering,
            ...filters,
        });

        // Фильтруем элементы с prolongation и contract_guid
        const prolongationData = data.results.filter(
            (el) => el.prolongation && el.prolongation.contract_guid
        );

        // Если нет подходящих данных, возвращаем пустой результат
        if (prolongationData.length === 0) {
            return {
                count: 0,
                next: null,
                previous: null,
                results: [],
            };
        }

        // Получаем данные о потерях контрактов для всех подходящих элементов
        const contractLossPromises = prolongationData.map(async (el) => {
            try {
                const resp = await api.dwh.getContractLoss({
                    guid: el.prolongation.contract_guid!,
                });
                return { ...el, ...resp };
            } catch (error) {
                console.error(`Error getting contract loss for guid ${el.prolongation.contract_guid}:`, error);
                return { ...el, lossData: null }; // Добавляем поле с ошибкой или null
            }
        });

        // Ожидаем выполнения всех запросов
        const enrichedResults = await Promise.all(contractLossPromises);

        return {
            count: enrichedResults.length,
            next: data.next,
            previous: data.previous,
            results: enrichedResults,
        };
    } catch (error) {
        console.error('Error in getDealsByFilters:', error);
        throw new Error('Failed to fetch deals data');
    }
};

export const getDealsBlobByFilters = async ({
    client,
    page,
    page_size,
    // ... остальные параметры
}) => {
    // Реализация getDealsBlobByFilters
};