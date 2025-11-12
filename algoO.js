// Просто объект с маппингом
export const EntityTypes = {
  SALES_POINT: {
    id: 1,
    shortName: "SP"
  },
  SP_UNIT: {
    id: 2,
    shortName: "SPU" 
  },
  BANK_INSURANCE_SALES_POINT: {
    id: 3,
    shortName: "BISP"
  }
} as const;

export type EntityType = keyof typeof EntityTypes;

// В пропсах используешь строковый ключ:
type ComponentProps = {
  entityType: EntityType;
};

const Component: React.FC<ComponentProps> = ({ entityType }) => {
  const entity = EntityTypes[entityType];
  // entity.id - цифра
  // entity.shortName - короткое название
  
  return (
    <div>
      ID: {entity.id}, Name: {entity.shortName}
    </div>
  );
};

// Использование:
<Component entityType="SALES_POINT" />