export const mapDtoToSchema = (filters: Filters): ActivityFiltersFormSchema => {
    return {
        client: filters.client,
        activity_type: filters.activity_types?.split(",").map(id => {
            const found = activityType.find(type => type.id.toString() === id.trim());
            return { label: found!.name, value: found!.id.toString() };
        }),
        activity_status: filters.activity_statuses?.split(",").map(id => {
            const found = activityStatus.find(status => status.id.toString() === id.trim());
            return { label: found!.name, value: found!.id.toString() };
        }),
        deadline: filters.deadline ? [new Date(filters.deadline)] : undefined,
    };
};

export const mapSchemaToDto = (
    schema: ActivityFiltersFormSchema,
): Record<string, string | string[] | undefined> => {
    return {
        client: schema.client,
        activity_types: schema.activity_type?.map(item => item.value).join(","),
        activity_statuses: schema.activity_status?.map(item => item.value).join(","),
        deadline: schema.deadline?.[0]?.toISOString(),
    };
};