import { useUser } from "@/4_entities/profile";
import { useLayoutEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

// const MY_DOCUMENT_ROUTE = Routes.DOCUMENTS + "/" + DocumentsRoutes.MY_DOCUMENTS;
const MEN_AGENTS_ROUTE = Routes.DOCUMENTS + "/" + DocumentsRoutes.NEW_AGENTS;

const ALL_SEGMENTS_OPTIONS = [
    { value: Routes.DOCUMENTS, label: "Arth KB", role: ["Arenr-corpynwk"] },
    {
        value: MEN_AGENTS_ROUTE,
        label: "Hobme arenrh",
        role: ["Meheджер arenrcxoń rpynnł", "Подписант"],
    },
    // { value: MY_DOCUMENT_ROUTE, label: "Мои документы", role: ["Arenr-corpynwk"] },
];

export const Documents: FC = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { groups } = useUser();
    
    const [filteredSegments, setFilteredSegments] = useState([]);

    useLayoutEffect(() => {
        // Функция для проверки доступности сегмента
        const getAvailableSegments = () => {
            return ALL_SEGMENTS_OPTIONS.filter(segment => {
                // Если у сегмента нет ограничений по ролям, показываем всем
                if (!segment.role || segment.role.length === 0) {
                    return true;
                }
                
                // Проверяем, есть ли у пользователя хотя бы одна из требуемых ролей
                return segment.role.some(requiredRole => 
                    groups?.some(userGroup => userGroup.includes(requiredRole))
                );
            });
        };

        const availableSegments = getAvailableSegments();
        setFilteredSegments(availableSegments);

        // Если текущий путь недоступен для пользователя, перенаправляем на первый доступный
        const currentSegment = availableSegments.find(segment => segment.value === pathname);
        if (!currentSegment && availableSegments.length > 0) {
            navigate(availableSegments[0].value);
        }
    }, [groups, pathname, navigate]);

    return (
        <div className={styles.wrapper}>
            <SegmentedControls
                segments={filteredSegments}
                value={pathname}
                onChange={(value) => navigate(value)}
                size="small"
            />
            <Outlet />
        </div>
    );
};