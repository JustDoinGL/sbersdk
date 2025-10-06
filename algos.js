const onSubmit = (data: FormCrmData) => {
  // Отправляем событие в аналитику при переходе к экрану кросс-сейла
  dataLayerPush({
    action: 'go_to_cross_sell_from_fos',
    label: analyticLabel
  });

  // Перезаписываем leadAdditionalParameters
  const newForm = {
    ...form,
    [service]: {
      ...form[service],
      leads: {
        ...form[service].leads,
        data_leadAdditionalParameters: data.leadAdditionalParameters // перезаписываем
      }
    }
  };

  // Формируем данные для отправки запроса
  setFormData({
    url: form.service.url,
    data: {
      ...sberCrmDataCollection({
        ...newForm // используем обновленную форму
      }, data)
    }
  });

  if (timerId) {
    dispatch(
      submitRequest({
        analyticLabel,
        keepalive: false,
        visitorId: visitorId.current,
        productName: null
      })
    );
  }
};