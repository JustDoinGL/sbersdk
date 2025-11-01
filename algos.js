// Типы для ролей
type UserRole = 'branch_curator' | 'sales_manager';

// Тип для точки продаж
interface SalesPoint {
  id?: string;
  sales_point_code?: string;
  bank_partner?: number;
  sales_point_name?: string;
  segment?: number;
  managers?: string[];
}

// Тип для конфигурации доступности полей
interface FieldAccessConfig {
  disabled: boolean;
  visible: boolean;
}

// Основная функция для определения доступности полей
export const getFieldAccessConfig = (
  userRole: UserRole,
  salesPoint: SalesPoint | null,
  fieldName: keyof SalesPoint
): FieldAccessConfig => {
  // Если данных нет, поле disabled
  if (!salesPoint) {
    return {
      disabled: true,
      visible: userRole === 'branch_curator' // Только куратор может создавать новые
    };
  }

  const hasValue = salesPoint[fieldName] !== undefined && 
                   salesPoint[fieldName] !== null && 
                   salesPoint[fieldName] !== '';

  // Базовые правила видимости
  const baseVisibility = {
    sales_point_code: userRole === 'branch_curator',
    bank_partner: userRole === 'branch_curator',
    sales_point_name: true,
    segment: userRole === 'branch_curator',
    managers: true,
    id: false // скрытое поле
  };

  // Базовые правила доступности
  const baseAccess = {
    branch_curator: {
      sales_point_code: !hasValue,
      bank_partner: !hasValue,
      sales_point_name: true,
      segment: !hasValue,
      managers: true
    },
    sales_manager: {
      sales_point_code: true, // всегда readonly для менеджера
      bank_partner: true, // всегда readonly для менеджера
      sales_point_name: !hasValue,
      segment: true, // всегда readonly для менеджера
      managers: !hasValue
    }
  };

  return {
    disabled: baseAccess[userRole][fieldName] ?? true,
    visible: baseVisibility[fieldName] ?? false
  };
};

// Хук для использования в компонентах
export const useSalesPointFormAccess = (userRole: UserRole, salesPoint: SalesPoint | null) => {
  const getFieldProps = (fieldName: keyof SalesPoint) => {
    const config = getFieldAccessConfig(userRole, salesPoint, fieldName);
    
    return {
      disabled: config.disabled,
      style: {
        display: config.visible ? 'block' : 'none'
      }
    };
  };

  return { getFieldProps };
};

// Пример использования в компоненте
const SalesPointForm: React.FC<{
  userRole: UserRole;
  initialData?: SalesPoint;
}> = ({ userRole, initialData }) => {
  const { getFieldProps } = useSalesPointFormAccess(userRole, initialData || null);

  return (
    <div className="form-container">
      {/* Код ТП - только для куратора, disabled если уже есть значение */}
      <div className="field">
        <FieldLabel required label="Код ТП" size={20}/>
        <ControlledSelectBoxField
          {...getFieldProps('sales_point_code')}
          data-test-id="sales-point-code-input"
          control={form.control}
          name="sales_point_code"
          // другие props...
        />
      </div>

      {/* Банк-партнер - только для куратора, disabled если уже есть значение */}
      <div className="field">
        <FieldLabel required label="Банк-партнер" size={20}/>
        <ControlledSelectBoxField
          {...getFieldProps('bank_partner')}
          data-test-id="bank-partner-input"
          control={form.control}
          name="bank_partner"
          // другие props...
        />
      </div>

      {/* Наименование ТП - доступно всем, disabled если нет значения */}
      <div className="field">
        <FieldLabel required label="Наименование ТП" size={20}/>
        <ControlledSelectBoxField
          {...getFieldProps('sales_point_name')}
          data-test-id="sales-point-name-input"
          control={form.control}
          name="sales_point_name"
          // другие props...
        />
      </div>

      {/* Сегмент - только для куратора, disabled если уже есть значение */}
      <div className="field">
        <FieldLabel required label="Сегмент" size={20}/>
        <ControlledSelectBoxField
          {...getFieldProps('segment')}
          data-test-id="segment-input"
          control={form.control}
          name="segment"
          // другие props...
        />
      </div>

      {/* Менеджеры - доступно всем, disabled если нет значения */}
      <div className="field">
        <FieldLabel required label="Менеджеры" size={20}/>
        <ControlledSelectBoxField
          {...getFieldProps('managers')}
          data-test-id="managers-input"
          control={form.control}
          name="managers"
          // другие props...
        />
      </div>
    </div>
  );
};

// Вспомогательная функция для преобразования данных
export const mapSchemaToDto = (
  schema: any,
  userRole: UserRole,
  existingData?: SalesPoint
): Partial<PatchBankSalesPointDto> => {
  const dto: Partial<PatchBankSalesPointDto> = {};

  // Куратор может менять все поля
  if (userRole === 'branch_curator') {
    dto.sales_point_name = schema.sales_point_name;
    dto.sales_point_code = schema.sales_point_code?.toString();
    dto.bank_partner = Number(schema.bank_partner?.value);
    dto.segment = Number(schema.segment?.value);
    dto.managers = schema.managers;
  }
  
  // Менеджер может менять только название и менеджеров
  if (userRole === 'sales_manager') {
    dto.sales_point_name = schema.sales_point_name;
    dto.managers = schema.managers;
    // Остальные поля берутся из существующих данных
    if (existingData) {
      dto.sales_point_code = existingData.sales_point_code;
      dto.bank_partner = existingData.bank_partner;
      dto.segment = existingData.segment;
    }
  }

  return dto;
};