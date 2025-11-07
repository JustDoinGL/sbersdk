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
    activity_types: filters.activity_types?.map((item) => item.value),
    activity_statuses: filters.activity_statuses?.map((item) => item.value),
    deadline: filters.deadline ? [new Date(filters.deadline)] : undefined,
  };
};

export const mapSchemaToDto = (
  schema: ActivityFiltersFormSchema,
): Record<string, string | string[] | undefined> => {
  return {
    client: schema.client,
    activity_types: schema.activity_types?.map((item) => item.value),
    activity_statuses: schema.activity_statuses?.map((item) => item.value),
    deadline: schema.deadline?.[0]?.toISOString(),
  };
};
