// hooks/useActStatus.ts
import { useMemo } from 'react';
import { useUser } from '@/path/to/your/useUser';
import { ActDto } from '@/5_shared/api';

// Конфигурация статусов для каждой роли
export const ACT_STATUS_CONFIG = {
  AGENT: {
    statusMap: 'act_status_agent_representation',
    statuses: {
      decline: [2, 4, 6] as const,
      done: [7, 8] as const,
      sign: [1, 3, 5] as const,
      paid: [8] as const,
    },
    allowedStatuses: [1, 3, 5, 7, 8] as const,
  },
  MAG: {
    statusMap: 'act_status_mag_representation',
    statuses: {
      decline: [4, 6] as const,
      done: [7] as const,
      sign: [1, 2, 3] as const,
      paid: [] as const, // MAG не видит оплату
    },
    allowedStatuses: [1, 2, 3, 4, 6, 7] as const,
  },
  SIGNER: {
    statusMap: 'act_status',
    statuses: {
      decline: [2, 4, 6] as const,
      done: [7, 8] as const,
      sign: [1, 3, 5] as const,
      paid: [8] as const,
    },
    allowedStatuses: [1, 2, 3, 4, 5, 6, 7, 8] as const,
  },
} as const;

export type ActRole = keyof typeof ACT_STATUS_CONFIG;

// Типы для хука
interface UseActStatusReturn {
  // Методы для конкретной роли
  isDeclineAct: (status: ActDto["status"], role: ActRole) => boolean;
  isDoneAct: (status: ActDto["status"], role: ActRole) => boolean;
  isSignAct: (status: ActDto["status"], role: ActRole) => boolean;
  isPaid: (status: ActDto["status"], role: ActRole) => boolean;
  
  // Методы для текущего пользователя
  isDeclineActForCurrent: (status: ActDto["status"]) => boolean;
  isDoneActForCurrent: (status: ActDto["status"]) => boolean;
  isSignActForCurrent: (status: ActDto["status"]) => boolean;
  isPaidForCurrent: (status: ActDto["status"]) => boolean;
  
  // Общие методы
  getStatusMapKey: (role: ActRole) => string;
  getAllowedStatuses: (role: ActRole) => readonly number[];
  hasAccessToStatus: (role: ActRole, status: ActDto["status"]) => boolean;
  
  // Утилиты для текущего пользователя
  currentUserRole: ActRole | null;
  getCurrentUserStatusMapKey: () => string | null;
  canUserAccessStatus: (status: ActDto["status"]) => boolean;
  
  // Получение конфигурации роли
  getRoleConfig: (role: ActRole) => typeof ACT_STATUS_CONFIG[ActRole];
}

export const useActStatus = (): UseActStatusReturn => {
  const { user } = useUser();

  // Получение конфигурации роли
  const getRoleConfig = (role: ActRole) => {
    return ACT_STATUS_CONFIG[role];
  };

  // Методы для конкретной роли
  const isDeclineAct = (status: ActDto["status"], role: ActRole): boolean => {
    const config = getRoleConfig(role);
    return config.statuses.decline.some((el) => el === status);
  };

  const isDoneAct = (status: ActDto["status"], role: ActRole): boolean => {
    const config = getRoleConfig(role);
    return config.statuses.done.some((el) => el === status);
  };

  const isSignAct = (status: ActDto["status"], role: ActRole): boolean => {
    const config = getRoleConfig(role);
    return config.statuses.sign.some((el) => el === status);
  };

  const isPaid = (status: ActDto["status"], role: ActRole): boolean => {
    const config = getRoleConfig(role);
    return config.statuses.paid.some((el) => el === status);
  };

  // Методы для работы с ролями
  const getStatusMapKey = (role: ActRole): string => {
    return getRoleConfig(role).statusMap;
  };

  const getAllowedStatuses = (role: ActRole): readonly number[] => {
    return getRoleConfig(role).allowedStatuses;
  };

  const hasAccessToStatus = (role: ActRole, status: ActDto["status"]): boolean => {
    return getAllowedStatuses(role).includes(status);
  };

  // Утилиты для текущего пользователя
  const currentUserRole = useMemo((): ActRole | null => {
    if (!user?.role) return null;
    
    const userRole = user.role.toUpperCase() as ActRole;
    return ACT_STATUS_CONFIG[userRole] ? userRole : null;
  }, [user]);

  const getCurrentUserStatusMapKey = (): string | null => {
    return currentUserRole ? getStatusMapKey(currentUserRole) : null;
  };

  const canUserAccessStatus = (status: ActDto["status"]): boolean => {
    return currentUserRole ? hasAccessToStatus(currentUserRole, status) : false;
  };

  // Методы для текущего пользователя (удобные обертки)
  const isDeclineActForCurrent = (status: ActDto["status"]): boolean => {
    return currentUserRole ? isDeclineAct(status, currentUserRole) : false;
  };

  const isDoneActForCurrent = (status: ActDto["status"]): boolean => {
    return currentUserRole ? isDoneAct(status, currentUserRole) : false;
  };

  const isSignActForCurrent = (status: ActDto["status"]): boolean => {
    return currentUserRole ? isSignAct(status, currentUserRole) : false;
  };

  const isPaidForCurrent = (status: ActDto["status"]): boolean => {
    return currentUserRole ? isPaid(status, currentUserRole) : false;
  };

  return {
    // Методы для конкретной роли
    isDeclineAct,
    isDoneAct,
    isSignAct,
    isPaid,
    
    // Методы для текущего пользователя
    isDeclineActForCurrent,
    isDoneActForCurrent,
    isSignActForCurrent,
    isPaidForCurrent,
    
    // Общие методы
    getStatusMapKey,
    getAllowedStatuses,
    hasAccessToStatus,
    
    // Утилиты для текущего пользователя
    currentUserRole,
    getCurrentUserStatusMapKey,
    canUserAccessStatus,
    
    // Конфигурация
    getRoleConfig,
  };
};