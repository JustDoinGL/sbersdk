// hooks/useActStatus.ts
import { ActDto } from "@/5_shared/api";

export const ACT_STATUS_CONFIG = {
  AGENT: {
    decline: [2, 4, 6],
    done: [7, 8],
    sign: [1, 3, 5],
    paid: [8],
  },
  MAG: {
    decline: [4, 6],
    done: [7],
    sign: [1, 2, 3],
    paid: [],
  },
  SIGNER: {
    decline: [2, 4, 6],
    done: [7, 8],
    sign: [1, 3, 5],
    paid: [8],
  },
} as const;

export type ActRole = keyof typeof ACT_STATUS_CONFIG;

export const useActStatus = () => {
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

  return {
    isDeclineAct,
    isDoneAct,
    isSignAct,
    isPaid,
  };
};