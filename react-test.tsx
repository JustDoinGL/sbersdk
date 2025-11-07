export const mapSchemaToDto = (schema: ActivityFiltersFormSchema): Filters => {
    const data: Record<string, string> = {};
    
    if (schema.client) {
        data.client = schema.client;
    }
    
    if (schema.activity_type?.length) {
        data.activity_types = schema.activity_type.map(item => item.value).join(",");
    }
    
    if (schema.activity_status?.length) {
        data.activity_statuses = schema.activity_status.map(item => item.value).join(",");
    }
    
    if (schema.deadline?.length) {
        data.deadline = schema.deadline.map(date => date.getTime().toString()).join("%2C");
    }
    
    return data;
};
