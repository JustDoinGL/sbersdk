const promises = [
  ...toAdd.map((manager) =>
    api.sales_point
      .patchSalesPointManagers({
        instance_id: salesPoint.id,
        manager: parseInt(manager.value),
        action: 1,
        dto: 1,
      })
      .then(() => ({ success: true }))
      .catch(() => ({ success: false })),
  ),
  ...toRemove.map((manager) =>
    api.sales_point
      .patchSalesPointManagers({
        instance_id: salesPoint.id,
        manager: parseInt(manager.value),
        action: 2,
        dto: 1,
      })
      .then(() => ({ success: true }))
      .catch(() => ({ success: false })),
  ),
];

const results = await Promise.allSettled(promises);

const failed = results.filter(
  (result) => result.status === "fulfilled" && !result.value.success,
);

if (failed.length > 0) {
  console.error('Не удалось выполнить операции с менеджерами');
  
  const failedManagers = [];
  
  // Добавляем информацию о неудачных операциях
  failed.forEach((result, index) => {
    if (index < toAdd.length) {
      // Это была операция добавления
      const manager = toAdd[index];
      failedManagers.push(`добавить менеджера "${manager.label}"`);
    } else {
      // Это была операция удаления
      const managerIndex = index - toAdd.length;
      const manager = toRemove[managerIndex];
      failedManagers.push(`удалить менеджера "${manager.label}"`);
    }
  });
  
  push({
    title: `Ошибка при обновлении менеджеров`,
    message: `Не удалось: ${failedManagers.join(', ')}`,
    type: "error",
  });
  
  return { success: false };
}

managersRef.current = newManagers;

push({
  title: `Менеджеры успешно обновлены`,
  type: "positive",
});

return { success: true };
};

const handleAwesome = async () => {
  // refresh logic here
}