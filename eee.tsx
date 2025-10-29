const handleManagersChangeSimple = async (newManagers: Managers[]) => {
  const oldManagers = managersRef.current;
  const { toAdd, toDelete } = compareArrays(oldManagers, newManagers);
  
  let hasErrors = false;
  const errors: string[] = [];

  // Обрабатываем добавление
  for (const manager of toAdd) {
    try {
      await api.addManager(salesPoint.id, manager);
      console.log(`Менеджер ${manager.label} добавлен`);
    } catch (error) {
      console.error(`Ошибка добавления ${manager.label}:`, error);
      hasErrors = true;
      errors.push(`Не удалось добавить ${manager.label}`);
    }
  }

  // Обрабатываем удаление
  for (const manager of toDelete) {
    try {
      await api.deleteManager(salesPoint.id, manager.value);
      console.log(`Менеджер ${manager.label} удален`);
    } catch (error) {
      console.error(`Ошибка удаления ${manager.label}:`, error);
      hasErrors = true;
      errors.push(`Не удалось удалить ${manager.label}`);
    }
  }

  // Обновляем ref если нет ошибок
  if (!hasErrors) {
    managersRef.current = newManagers;
    push({
      title: "Менеджеры успешно обновлены",
      type: "positive",
    });
  } else {
    push({
      title: "Ошибки при обновлении менеджеров",
      description: errors.join(', '),
      type: "negative",
    });
  }

  return { success: !hasErrors, errors };
};