import { getClientFio } from "@/4_entities/client";
import { ActivityDto, ReferenceItem } from "@/5_shared/api";
import { LONG_DASH } from "@/5_shared/consts";
import { dateUtils } from "@/5_shared/date";
import { referenceService } from "@/5_shared/reference";
import { formatName } from "@/shared/lib/converters";

export const SORTER_MAPPER = {
  deal_end_date: "deal_end_date",
  manager: "manager_last_name",
  client: "client_last_name",
};

export const FILTER_MAPPER = {
  // Убрали лишние поля, оставили только соответствующие макету
  activity_status: "activity_statuses",
  deadline: ["deadline_from", "deadline_to"],
  activity_type: "activity_types",
  client: "search", // Для поиска по ФИО клиента
  // segment и deal_end_date убраны, так как их нет в макете
};

export type TableActivity = {
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

export const mapActivitiesDtoToTableActivities = (
  dtoActivities: ActivityDto[],
): TableActivity[] => {
  const activityTypeDict = referenceService.getDictMap("activity_type");
  const activityStatusDict = referenceService.getDictMap("activity_status");

  return dtoActivities.map((dtoActivity) => {
    return {
      ...dtoActivity,
      id: dtoActivity.number,
      deal: dtoActivity.deal_number,
      deal_end_date: dateUtils.getLocalDate(dtoActivity.deal_end_date),
      activity_status: activityStatusDict?.[dtoActivity.activity_status] || null,
      activity_type: activityTypeDict?.[dtoActivity.activity_type]?.name || "",
      origin: dtoActivity,
      deadline: dateUtils.getLocalDate(dtoActivity.deadline),
      client: dtoActivity.client_data ? getClientFio(dtoActivity.client_data) : "",
      manager: dtoActivity.manager_data
        ? formatName(dtoActivity.manager_data, [
            { name: "last_name", length: "full" },
            { name: "first_name", length: "short" },
            { name: "patronymic", length: "short" },
          ])
        : LONG_DASH,
    };
  });
};