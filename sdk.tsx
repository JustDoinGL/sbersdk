// hooks/useActivitiesTable.ts
import { useTableState } from './your-table-state-path';

export const useActivitiesTable = (canScope: boolean, user: any) => {
  return useTableState<TableActivity>(
    canScope ? { segment: user.business_segment?.toString() || "", scope: "my" } : {}
  );
};