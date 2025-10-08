useEffect(() => {
  if (current_client) {
    // Преобразуем данные для совместимости типов
    const transformedClient = {
      ...current_client,
      client_managers: current_client.client_managers?.map(manager => ({
        ...manager,
        user: {
          ...manager.user,
          patronymic: manager.user.patronymic || '' // преобразуем null в пустую строку
        }
      })) || []
    };
    form.setValue("mrmClient", transformedClient as any);
  } else {
    form.setValue("mrmClient", undefined);
  }
}, [current_client]);