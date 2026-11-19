// hooks/useProgramVariantsQuery.ts
import { useQuery } from '@tanstack/react-query';
import { apiDms } from '...'; // ваш путь
import { dateUtils } from '...'; // ваш путь
import { sortVariantsByPrice } from '...'; // ваш путь

// Описываем интерфейс того, что нужно хуку для работы
interface ProgramVariantsQueryParams {
  programId: string | number;
  birthDate: string;
  gender: "F" | "M"; // или ваш тип
  peopleCount: number;
  isRegionAvailable: boolean;
  regionFiasId?: string;
  isFranchiseAvailable: boolean;
  franchise?: number | string;
  // Флаг для enabled
  enabled: boolean; 
}

export const useProgramVariantsQuery = (params: ProgramVariantsQueryParams) => {
  return useQuery({
    // queryKey — это "паспорт" кэша. Все параметры, от которых зависит ответ, должны быть здесь.
    queryKey: ['programVariants', params],
    queryFn: async () => {
      const { 
        programId, birthDate, gender, peopleCount, 
        isRegionAvailable, regionFiasId, 
        isFranchiseAvailable, franchise 
      } = params;

      const { data } = await apiDms.filterProgramVariants({
        programId,
        dateOfBirth: dateUtils.getIsoDate(birthDate),
        genderType: gender === "F" ? "FEMALE" : "MALE",
        peopleCount,
        ...(isRegionAvailable && regionFiasId ? { regionFiasId } : {}),
        ...(isFranchiseAvailable && franchise !== undefined ? { deductible: Number(franchise) } : {}),
      });

      // Сортируем данные прямо в queryFn. Компонент получит уже готовый массив.
      return sortVariantsByPrice(data);
    },
    // Запрос выполнится только если enabled === true
    enabled: params.enabled,
    // Опционально: не перезапрашивать при возврате фокуса на окно, если данные редко меняются
    // refetchOnWindowFocus: false, 
  });
};