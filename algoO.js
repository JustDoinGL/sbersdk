import { Routes } from "@/5_shared/routes/routes.desktop";
import { useUser } from "@/4_entities/profile";
import { useNavigate, useLocation } from "react-router-dom";
import { useLayoutEffect, useState } from "react";

const MY_DOCUMENT_ROUTE = Routes.DOCUMENTS + "/" + DocumentsRoutes.MY_DOCUMENTS;
const NEW_AGENTS_ROUTE = Routes.DOCUMENTS + "/" + DocumentsRoutes.NEW_AGENTS;

// Декларативное описание сегментов с правилами доступа
const DOCUMENT_SEGMENTS = [
  {
    value: Routes.DOCUMENTS,
    label: "Архив КД",
    isAvailable: (user) => user.isAgent || user.isMag || user.isWriter,
  },
  {
    value: MY_DOCUMENT_ROUTE,
    label: "Мои документы", 
    isAvailable: (user) => user.isAgent,
  },
  {
    value: NEW_AGENTS_ROUTE,
    label: "Новые агенты",
    isAvailable: (user) => user.isMag,
  },
] as const;

export const Documents: FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useUser();
  
  const [availableSegments, setAvailableSegments] = useState<typeof DOCUMENT_SEGMENTS>([]);

  useLayoutEffect(() => {
    // Фильтрация сегментов по доступным для пользователя
    const filteredSegments = DOCUMENT_SEGMENTS.filter(segment => 
      segment.isAvailable(user)
    );
    
    setAvailableSegments(filteredSegments);

    // Перенаправление если текущий путь недоступен
    const isCurrentPathAvailable = filteredSegments.some(segment => 
      segment.value === pathname
    );
    
    if (!isCurrentPathAvailable && filteredSegments.length > 0) {
      navigate(filteredSegments[0].value);
    }
  }, [user, pathname, navigate]);

  return (
    <div className={styles.wrapper}>
      <SegmentedControls
        segments={availableSegments}
        value={pathname}
        onChange={(value) => navigate(value)}
        size="small"
      />
    </div>
  );
};