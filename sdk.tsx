// 1. Формируем массив промисов: один для полисодержателя + по одному для каждого застрахованного
const savePromises = [
  saveEpkClient("policyholder"),
  ...insureds.map((_, idx) => saveEpkClient(`insureds.${idx}`))
];

// 2. Запускаем все запросы параллельно и ждем их завершения
// results будет массивом булевых значений, например: [true, false, true]
const results = await Promise.all(savePromises);

// 3. Проверяем, есть ли хотя бы один false в результатах
const isAllValid = results.every(result => result === true);

// 4. Если есть невалидные данные, кидаем ошибку в форму
if (!isAllValid) {
  form.setError("root", {
    message: "Паспортные данные одного из страхователей или застрахованных лиц невалидны. Пожалуйста, проверьте форму."
  });
  
  // Если тебе нужно прервать дальнейшее выполнение кода (как в твоем примере с throw)
  throw new Error("Not all EPK clients are valid"); 
}

// --- Дальше идет твой код проверки isProductFormValid ---