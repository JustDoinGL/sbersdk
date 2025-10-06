const onSubmit = (data: FormCrmData) => {
  // Отправляем событие в аналитику при переходе к экрану кросс-сейла
  dataLayerPush({
    action: 'go_to_cross_sell_from_fos',
    label: analyticLabel
  });

  const newForm = {
    ...form,
    service: {
      ...form.service,
      leads: [
        {
          ...form.service.leads[0],
          leadAdditionalParameters: data.leadAdditionalParameters 
            ? data.leadAdditionalParameters.map(param => ({
                additionalParameterCode: param.additionalParameterCode,
                additionalParameterValue: param.additionalParameterValue
              }))
            : []
        }
      ]
    }
  };

  // Формируем данные для отправки запроса
  setFormData({
    url: form.service.url,
    data: {
      ...sberCrmDataCollection(newForm, data)
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