// policyConfig.ts

export type PolicyStatus = 
  | 'DRAFT_INCOMPLETE' 
  | 'DRAFT_REWORK'     
  | 'READY_TO_SEND'    
  | 'SENT';            

export interface PolicyConfig {
  id: PolicyStatus;
  title: string;
  description: string;
  actionLabel: string | null;
  isActionEnabled: boolean;
  opensModal: boolean; 
  showSendButton: boolean; 
  isSent: boolean; 
}

export const POLICY_STATUSES: Record<PolicyStatus, PolicyConfig> = {
  DRAFT_INCOMPLETE: {
    id: 'DRAFT_INCOMPLETE',
    title: 'Образец полиса',
    description: 'Для просмотра образца документа заполните все обязательные данные',
    actionLabel: 'Сформировать документы',
    isActionEnabled: true,
    opensModal: true,
    showSendButton: false,
    isSent: false,
  },
  DRAFT_REWORK: {
    id: 'DRAFT_REWORK',
    title: 'Образец полиса',
    description: 'При необходимости сформируйте документы для просмотра. Данные были изменены.', 
    actionLabel: 'Переформировать документы',
    isActionEnabled: true,
    opensModal: true,
    showSendButton: false, 
    isSent: false,
  },
  READY_TO_SEND: {
    id: 'READY_TO_SEND',
    title: 'Образец полиса',
    description: 'Документы успешно сформированы. Проверьте их перед отправкой.',
    actionLabel: 'Отправить',
    isActionEnabled: true,
    opensModal: true, 
    showSendButton: true, 
    isSent: false,
  },
  SENT: {
    id: 'SENT',
    title: 'Образец полиса',
    description: 'Образец полиса отправлен в страховую компанию.',
    actionLabel: null, 
    isActionEnabled: false,
    opensModal: false, 
    showSendButton: false,
    isSent: true,
  },
};



// PolicyController.ts
import { POLICY_STATUSES, PolicyStatus, PolicyConfig } from './policyConfig';

export class PolicyController {
  private currentStatus: PolicyStatus;

  constructor(initialStatus: PolicyStatus = 'DRAFT_INCOMPLETE') {
    this.currentStatus = initialStatus;
  }

  /**
   * Возвращает полный объект конфигурации для текущего статуса.
   * View (React) будет использовать это для рендера.
   */
  public getCurrentConfig(): PolicyConfig {
    return POLICY_STATUSES[this.currentStatus];
  }

  /**
   * Возвращает только ID текущего статуса (если нужно для логики).
   */
  public getStatus(): PolicyStatus {
    return this.currentStatus;
  }

  /**
   * Метод для смены статуса.
   * Вызывается, например, после успешного ответа от API.
   */
  public setStatus(newStatus: PolicyStatus): void {
    console.log(`[PolicyController] Смена статуса: ${this.currentStatus} -> ${newStatus}`);
    this.currentStatus = newStatus;
  }

  // --- Бизнес-логика переходов (примеры) ---

  /**
   * Пользователь нажал "Сформировать документы".
   * (В реальности здесь может быть запрос к API).
   */
  public handleFormationSuccess(): void {
    // После формирования документов переводим в "Готов к отправке"
    this.setStatus('READY_TO_SEND');
  }

  /**
   * Пользователь нажал "Отправить".
   */
  public handleSendSuccess(): void {
    this.setStatus('SENT');
  }

  /**
   * Система вернула ошибку, требуется переделать.
   */
  public handleReworkNeeded(): void {
    this.setStatus('DRAFT_REWORK');
  }
}
