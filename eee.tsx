const handleManagersChangeWithSettled = async (newManagers: Managers[]): Promise<{success: boolean}> => {
  const oldManagers = managersRef.current;
  
  const toAdd = newManagers.filter(newItem => 
    !oldManagers.some(oldItem => oldItem.value === newItem.value)
  );
  
  const toRemove = oldManagers.filter(oldItem => 
    !newManagers.some(newItem => newItem.value === newItem.value)
  );

  if (toAdd.length === 0 && toRemove.length === 0) {
    return { success: true };
  }

  const promises = [
    ...toAdd.map(manager => 
      api.patchedSetManagers({
        instance_id: salesPoint.id,
        manager: parseInt(manager.value),
        action: ActionEnum.ADD,
        dto: DtoEnum.SALES_POINT
      }).then(() => ({ type: 'add', manager, success: true }))
    ),
    ...toRemove.map(manager => 
      api.patchedSetManagers({
        instance_id: salesPoint.id,
        manager: parseInt(manager.value),
        action: ActionEnum.REMOVE,
        dto: DtoEnum.SALES_POINT
      }).then(() => ({ type: 'remove', manager, success: true }))
    )
  ];

  const results = await Promise.allSettled(promises);
  
  const successful = results.filter((result): result is PromiseFulfilledResult<any> => 
    result.status === 'fulfilled'
  );
  const failed = results.filter(result => result.status === 'rejected');

  if (failed.length > 0) {
    console.error(`Не удалось выполнить ${failed.length} операций с менеджерами`);
    push({
      title: `Ошибка в ${failed.length} операциях с менеджерами`,
      type: "negative",
    });
    return { success: false };
  }

  managersRef.current = newManagers;
  push({
    title: `Успешно обновлено ${successful.length} менеджеров`,
    type: "positive",
  });
  
  return { success: true };
};