export const mapDtoToSchema = (filters: Filters): DealFiltersFormSchema => {
    const dealTypeChoices = referencesService.getDictSet("deal_type_choices");
    const insuranceTypeChoices = referencesService.getDictSet("insurance_type_choices");
    const dealStageChoices = referencesService.getDictSet("deal_stage");

    return {
        deal_type: filters?.deal_type ? {
            value: filters.deal_type.trim(),
            label: dealTypeChoices.find(type => type.id.toString() === filters.deal_type.trim())?.name || ''
        } : undefined,

        insurance: filters?.insurance?.split(",").map((id) => {
            const found = insuranceTypeChoices.find((type) => type.id.toString() === id.trim());
            return { label: found?.name || '', value: found?.id.toString() || id.trim() };
        }),

        stage: filters?.stage?.split(",").map((id) => {
            const found = dealStageChoices.find((status) => status.id.toString() === id.trim());
            return { label: found?.name || '', value: found?.id.toString() || id.trim() };
        }),

        end_date: filters?.end_date
            ? filters.end_date.split(",").map((datestr) => new Date(datestr.trim()))
            : undefined,
    };
};