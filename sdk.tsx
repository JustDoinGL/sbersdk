import {
    TablesalesPointActivities,
    TablesalesPointBankInsurance,
    TablesalesPointDirectSales,
} from "@/3_features/sales_point";
import { useState, useEffect } from "react";
import { useLocation } from "react-router";

export const usesales = () => {
    const { pathname } = useLocation();
    const [selectedSalesPoint, setSelectedSalesPoint] = useState<
        TablesalesPointDirectSales | TablesalesPointBankInsurance | null
    >(null);
    const [selectedActivity, setSelectedActivity] = useState<TablesalesPointActivities | null>(null);
    const [salesPointIds, setSalesPointIds] = useState<string[]>([]);

    useEffect(() => {
        // Регулярное выражение для поиска всех sales_point_{id}
        const regex = /sales_point_(\d+)/g;
        const matches = pathname.match(regex);
        
        if (matches) {
            // Извлекаем только ID (убираем "sales_point_")
            const ids = matches.map(match => match.replace('sales_point_', ''));
            setSalesPointIds(ids);
            
            // Можно также установить первый ID как выбранную точку продаж, если нужно
            // Например: fetchSalesPoint(ids[0])
        } else {
            setSalesPointIds([]);
        }
    }, [pathname]);

    return { 
        selectedSalesPoint, 
        setSelectedSalesPoint, 
        selectedActivity, 
        setSelectedActivity,
        salesPointIds // массив найденных ID
    };
};