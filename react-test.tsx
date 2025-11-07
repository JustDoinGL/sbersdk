import { ActivityFiltersFormSchema } from "./schema";
import { referencesService } from "@/5_shared/reference";
import { Filters } from "@/5_shared/ui";

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

export const mapDtoToSchema = (filters: Filters): ActivityFiltersFormSchema => {
    return {
        client: filters.client,
        activity_types: filters.activity_types?.split(",").map(id => {
            const found = activityType.find(type => type.id.toString() === id.trim());
            return found ? { label: found.name, value: found.id.toString() } : null;
        }).filter(Boolean),
        activity_statuses: filters.activity_statuses?.split(",").map(id => {
            const found = activityStatus.find(status => status.id.toString() === id.trim());
            return found ? { label: found.name, value: found.id.toString() } : null;
        }).filter(Boolean),
        deadline: filters.deadline ? [new Date(filters.deadline)] : undefined,
    };
};

export const mapSchemaToDto = (
    schema: ActivityFiltersFormSchema,
): Record<string, string | string[] | undefined> => {
    return {
        client: schema.client,
        activity_types: schema.activity_types?.map(item => item.value).join(","),
        activity_statuses: schema.activity_statuses?.map(item => item.value).join(","),
        deadline: schema.deadline?.[0]?.toISOString(),
    };
};