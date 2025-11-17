// hooks/useActStatus.ts
import { ActDto } from "@/5_shared/api";
import { useUser } from "@/path/to/your/useUser";

export const ACT_STATUS_CONFIG = {
  AGENT: {
    decline: [2, 4, 6],
    done: [7, 8],
    sign: [1, 3, 5],
    paid: [8],
    canSign: [1, 3, 5], // статусы, которые может подписывать
  },
  MAG: {
    decline: [4, 6],
    done: [7],
    sign: [1, 2, 3],
    paid: [],
    canSign: [1, 2, 3], // статусы, которые может подписывать
  },
  SIGNER: {
    decline: [2, 4, 6],
    done: [7, 8],
    sign: [1, 3, 5],
    paid: [8],
    canSign: [1, 3, 5], // статусы, которые может подписывать
  },
} as const;

export type ActRole = keyof typeof ACT_STATUS_CONFIG;

export const useActStatus = () => {
  const { user } = useUser();

  const getUserRole = (): ActRole | null => {
    if (!user?.groupsMap) return null;

    if (user.groupsMap.has("Подписант")) return "SIGNER";
    if (user.groupsMap.has("Менеджер агентской группы")) return "MAG";
    if (user.groupsMap.has("Агент-сотрудник")) return "AGENT";

    return null;
  };

  const currentRole = getUserRole();

  const isDeclineAct = (status: ActDto["status"], role: ActRole): boolean => {
    return ACT_STATUS_CONFIG[role].decline.includes(status);
  };

  const isDoneAct = (status: ActDto["status"], role: ActRole): boolean => {
    return ACT_STATUS_CONFIG[role].done.includes(status);
  };

  const isSignAct = (status: ActDto["status"], role: ActRole): boolean => {
    return ACT_STATUS_CONFIG[role].sign.includes(status);
  };

  const isPaid = (status: ActDto["status"], role: ActRole): boolean => {
    return ACT_STATUS_CONFIG[role].paid.includes(status);
  };

  const canSign = (status: ActDto["status"], role: ActRole): boolean => {
    return ACT_STATUS_CONFIG[role].canSign.includes(status);
  };

  return {
    isDeclineAct,
    isDoneAct,
    isSignAct,
    isPaid,
    canSign,
    currentRole,
  };
};