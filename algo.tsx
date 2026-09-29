import React, { ReactNode } from 'react';

type BadgeItem = {
  label: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'default';
  size?: number;
};

type PersonCardProps = {
  title: string;
  prefix: string;

  fio?: string;
  passportLine?: string;

  isFilled: boolean;

  /**
   * Если insurance передан — это insured.
   * В этом случае badges не отображаются.
   *
   * Если insurance не передан — это policyholder.
   * В этом случае badges отображаются.
   */
  insurance?: unknown;

  badges?: BadgeItem[];

  editForm: ReactNode;

  removeTitle: string;
  removeDescription: string;

  onSave: () => void | Promise<void>;
  onRemove: () => void;
};

export const PersonCard = ({
  title,
  prefix,
  fio,
  passportLine,
  isFilled,
  insurance,
  badges = [],
  editForm,
  removeTitle,
  removeDescription,
  onSave,
  onRemove,
}: PersonCardProps) => {
  const isInsured = insurance !== undefined;

  return (
    <>
      <style>
        {`
          .person-card-name {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
          }

          .person-card-modal-form {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          .person-card-remove {
            display: flex;
            justify-content: center;
          }

          .person-card-badge {
            align-self: flex-start;
          }
        `}
      </style>

      <ContentCard
        isError={!isFilled}
        modal={{
          title,
          content: (
            <div className="person-card-modal-form">
              {editForm}

              <RemoveConfirmation
                title={removeTitle}
                description={removeDescription}
                onDelete={onRemove}
                buttonClassName="person-card-remove"
              />
            </div>
          ),
          onSave,
        }}
      >
        <div className="person-card-name">
          <Text
            font="body_1"
            color={colors.textAndIcons.bottom.secondary}
          >
            {fio}
          </Text>

          {!isInsured &&
            badges.map((badge) => (
              <Badge
                key={badge.label}
                label={badge.label}
                type={badge.type ?? 'info'}
                size={badge.size ?? 20}
                className="person-card-badge"
              />
            ))}
        </div>

        <Text font="body_1">
          {isFilled ? passportLine : 'Не хватает данных'}
        </Text>
      </ContentCard>
    </>
  );
};