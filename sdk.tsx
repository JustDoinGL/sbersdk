function formatPhone(phone) {
    return phone.replace(/(\+\d)(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 ($2) $3-$4-$5');
}

// Пример использования:
const result = formatPhone("+73456787654");
console.log(result); // "+7 (345) 678-76-54"