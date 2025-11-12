
import { api } from "@/5_shared/api";
import { Multiselect, MultiselectProps, useToast, type Option } from "@sg/utkit";
import { useRef, useState } from "react";

type Props = {
    unitId: string;
    preview: Record<string, string>;
} & Omit<MultiselectProps<string>, "options">;

export const SalesPointMultiselectManager: React.FC<Props> = ({ 
    unitId, 
    preview, 
    ...rest 
}) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const searchRef = useRef<string>("");
    const [managerOptions, setManagerOptions] = useState<Option<string>[]>([]);
    const [error, setError] = useState(false);

    const { push } = useToast();

    const fetchManagers = async (search: string) => {
        if (searchRef.current === search) {
            return;
        }

        searchRef.current = search;
        
        try {
            const response = await api.profile_methods.getProfileByQuery({
                query: search || " ",
                unitId: unitId // Добавляем unitId в запрос
            });
            
            const options = response.results.map((manager) => ({
                label: `${manager.last_name} ${manager.first_name} ${manager.patronymic || ""}`.trim(),
                value: manager.id.toString(),
            }));
            
            setManagerOptions(options);
        } catch (e) {
            console.error("Ошибка при загрузке менеджеров:", e);
            setError(true);
            push({
                title: "Ошибка при загрузке списка менеджеров",
                type: "error",
            });
        }
    };

    const debouncedFetchManagers = (search: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            fetchManagers(search);
        }, 500);
    };

    const handleFocus = () => {
        fetchManagers("");
    };

    return (
        <Multiselect
            placeholder="Начните вводить имя менеджера..."
            onFocus={handleFocus}
            options={managerOptions}
            onInputChange={debouncedFetchManagers}
            selectedItemsDisplayMode="inline"
            hasError={error}
            {...rest}
        />
    );
};