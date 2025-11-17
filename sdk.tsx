import { ActDto } from "@/5_shared/api";
import { useUser } from "./useUser"; // предположим, что useUser отсюда

// Конфигурация статусов для разных ролей
const STATUS_CONFIG = {
  AGENT: {
    decline: [2, 4, 6],
    done: [7, 8],
    sign: [1, 3, 5],
    paid: [8],
    info: "act_status_agent_representation"
  },
  MAG: {
    decline: [2, 4],
    done: [7, 8],
    sign: [1, 3],
    paid: [8],
    info: "act_status_mag_representation"
  },
  SIGNER: {
    decline: [2, 6],
    done: [7, 8],
    sign: [1, 5],
    paid: [8],
    info: "act_status"
  }
} as const;

export class ActStatusService {
  private readonly role: keyof typeof STATUS_CONFIG;
  private readonly config: typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG];

  constructor(role?: keyof typeof STATUS_CONFIG) {
    // Если роль не передана, получаем из useUser
    this.role = role || this.getUserRole();
    this.config = STATUS_CONFIG[this.role];
  }

  private getUserRole(): keyof typeof STATUS_CONFIG {
    const user = useUser();
    // Предположим, что в user есть поле role
    return user.role as keyof typeof STATUS_CONFIG || "SIGNER";
  }

  public isDeclineAct(status: ActDto["status"]): boolean {
    return this.config.decline.includes(status);
  }

  public isDoneAct(status: ActDto["status"]): boolean {
    return this.config.done.includes(status);
  }

  public isSignAct(status: ActDto["status"]): boolean {
    return this.config.sign.includes(status);
  }

  public isPaid(status: ActDto["status"]): boolean {
    return this.config.paid.includes(status);
  }

  public get info(): string {
    return this.config.info;
  }

  // Метод для получения всех методов сразу
  public getMethods() {
    return {
      isDeclineAct: (status: ActDto["status"]) => this.isDeclineAct(status),
      isDoneAct: (status: ActDto["status"]) => this.isDoneAct(status),
      isSignAct: (status: ActDto["status"]) => this.isSignAct(status),
      isPaid: (status: ActDto["status"]) => this.isPaid(status),
      info: this.info
    };
  }

  // Статический метод для быстрого создания инстанса
  static create(role?: keyof typeof STATUS_CONFIG): ActStatusService {
    return new ActStatusService(role);
  }
}

// Хуки для удобного использования в React компонентах
export const useActStatus = (role?: keyof typeof STATUS_CONFIG) => {
  const service = new ActStatusService(role);
  return service.getMethods();
};

// Альтернативный вариант - фабрика функций
export const createActStatusCheckers = (role?: keyof typeof STATUS_CONFIG) => {
  const service = new ActStatusService(role);
  return service.getMethods();
};