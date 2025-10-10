interface ProductDto {
    adinsure_code: number | null;
    id: number;
    product_name: string;
    ui_name: string | null;
    insurance_type: number | null;
}

// Type guard для проверки ProductDto
function isProductDto(dto: any): dto is ProductDto {
    return (
        dto &&
        typeof dto === 'object' &&
        typeof dto.id === 'number' &&
        typeof dto.product_name === 'string'
    );
}

// Type guard для проверки массива ProductDto
function isProductDtoArray(data: any): data is ProductDto[] {
    return Array.isArray(data) && data.every(isProductDto);
}

// Использование в коде
const response = await api.reference_methods.getProducts({
    search,
    has_ui_name: "true",
});

// Проверка типа response.results
if (isProductDtoArray(response.results)) {
    if (response.count > response.results.length) {
        return [
            ...response.results, 
            { 
                label: "Уточните запрос", 
                checked: true,
                disabled: true
            }
        ];
    }
    return response.results;
} else {
    console.error('Invalid response format');
    return [];
}

// Или для одиночного объекта
return (dto: any) => {  
    if (isProductDto(dto)) {
        // Теперь TypeScript знает, что dto - ProductDto
        return dto.ui_name || dto.product_name;
    }
    return 'Неизвестный продукт';
};