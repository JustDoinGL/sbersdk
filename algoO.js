onChange={(e) => {
    const areDatesEqual = (date1, date2) => {
        if (!date1 && !date2) return true;
        if (!date1 || !date2) return false;
        
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    };
    
    if (areDatesEqual(field.value, e)) {
        console.log("Даты одинаковые, пропускаем");
        return;
    }
    
    field.onChange(e);
}}