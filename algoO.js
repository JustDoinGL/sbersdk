import { CurrentProfileDto } from "@/5_shared/api";
import { createContext, useContext } from "react";

type UserContext = CurrentProfileDto;

export const UserContext = createContext<UserContext | null>(null);

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("Нужно использовать внутри UserContext");
  }

  const groupsMap = new Map(context.groups.map(group => [group.name, true]));

  return {
    ...context,
    canFullSearch: context?.permissions.includes("auth.can_full_search"),
    allowTeam: !context.is_leaf,
    allowBranch: context.branches.length > 0,
    allowCompany: context.is_admin,
    isAgent: groupsMap.has("Агент-сотрудник"),
    isMag: groupsMap.has("Менеджер агентской группы"),
    isWriter: groupsMap.has("Подписант"),
  };
};